#!/usr/bin/env bash
# Deploy Project Ours API to Oracle VM (systemd + optional Quick Tunnel).
# Usage (from repo root or any cwd):
#   export ORACLE_HOST=ubuntu@<vm-ip>
#   export ORACLE_SSH_KEY=~/.ssh/id_ed25519_oracle
#   export NEON_CONNECTION_STRING='Host=...;SSL Mode=Require;...'   # for migrations
#   export PUBLIC_API_BASE_URL=https://<subdomain>.trycloudflare.com  # optional public health
#   ./scripts/infra/deploy-api.sh
#
# Optional:
#   SKIP_MIGRATE=1          — skip EF database update
#   SKIP_PUBLIC_HEALTH=1    — skip curl against PUBLIC_API_BASE_URL
#   DEPLOY_REMOTE_DIR=/opt/projectours/api
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SERVER_DIR="${REPO_ROOT}/server"
PUBLISH_DIR="${REPO_ROOT}/.publish/api"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/opt/projectours/api}"
SSH_USER_HOST="${ORACLE_HOST:?Set ORACLE_HOST (e.g. ubuntu@136.x.x.x)}"
SSH_KEY="${ORACLE_SSH_KEY:-${HOME}/.ssh/id_ed25519_oracle}"
SSH_OPTS=(-i "${SSH_KEY}" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new)
RSYNC_RSH="ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

log() { printf '[deploy-api] %s\n' "$*"; }
die() { printf '[deploy-api] ERROR: %s\n' "$*" >&2; exit 1; }

command -v dotnet >/dev/null || die "dotnet SDK not found"
command -v rsync >/dev/null || die "rsync not found (required for publish sync)"
command -v ssh >/dev/null || die "ssh not found"
command -v curl >/dev/null || die "curl not found"

[[ -f "${SSH_KEY}" ]] || die "SSH key not found: ${SSH_KEY}"

log "Publish Release linux-x64 → ${PUBLISH_DIR}"
rm -rf "${PUBLISH_DIR}"
mkdir -p "${PUBLISH_DIR}"
(
  cd "${SERVER_DIR}"
  dotnet publish src/ProjectOurs.API \
    -c Release \
    -r linux-x64 \
    --self-contained true \
    -o "${PUBLISH_DIR}"
)

if [[ "${SKIP_MIGRATE:-0}" != "1" ]]; then
  : "${NEON_CONNECTION_STRING:?Set NEON_CONNECTION_STRING for migrations (or SKIP_MIGRATE=1)}"
  log "Apply EF migrations (before restart)"
  (
    cd "${SERVER_DIR}"
    export PROJECTOURS_CONNECTION_STRING="${NEON_CONNECTION_STRING}"
    export ConnectionStrings__PostgreSQL="${NEON_CONNECTION_STRING}"
    dotnet ef database update \
      --project src/ProjectOurs.Infrastructure \
      --startup-project src/ProjectOurs.API
  )
else
  log "SKIP_MIGRATE=1 — skipping database update"
fi

log "Sync artifacts → ${SSH_USER_HOST}:${REMOTE_DIR}"
rsync -az --delete \
  -e "${RSYNC_RSH}" \
  "${PUBLISH_DIR}/" \
  "${SSH_USER_HOST}:${REMOTE_DIR}/"

log "Install systemd unit"
scp "${SSH_OPTS[@]}" \
  "${REPO_ROOT}/scripts/infra/projectours-api.service" \
  "${SSH_USER_HOST}:/tmp/projectours-api.service"

# Port must match ASPNETCORE_URLS on the VM (/etc/projectours/env) and
# server/.env.production.example — documented as 127.0.0.1:5280.
log "Restart systemd projectours-api and wait for local /health"
ssh "${SSH_OPTS[@]}" "${SSH_USER_HOST}" 'bash -s' <<'REMOTE'
set -euo pipefail

HEALTH_URL="http://127.0.0.1:5280/health"

dump_unit_logs() {
  echo "=== systemctl status projectours-api ===" >&2
  sudo systemctl status projectours-api --no-pager >&2 || true
  echo "=== journalctl -u projectours-api -n 80 ===" >&2
  sudo journalctl -u projectours-api -n 80 --no-pager >&2 || true
}

sudo cp /tmp/projectours-api.service /etc/systemd/system/projectours-api.service
sudo chmod 755 /opt/projectours/api/ProjectOurs.API
sudo systemctl daemon-reload
sudo systemctl reset-failed projectours-api || true
sudo systemctl restart projectours-api

# Type=simple: "active" means the process was started, not that Kestrel is listening yet.
became_active=0
for _ in $(seq 1 30); do
  state="$(sudo systemctl is-active projectours-api || true)"
  case "${state}" in
    active)
      became_active=1
      break
      ;;
    failed|inactive|deactivating)
      echo "[deploy-api] projectours-api entered state: ${state}" >&2
      dump_unit_logs
      exit 1
      ;;
    *)
      sleep 1
      ;;
  esac
done

if [[ "${became_active}" != "1" ]]; then
  echo "[deploy-api] projectours-api did not become active within 30s (last state=$(sudo systemctl is-active projectours-api || true))" >&2
  dump_unit_logs
  exit 1
fi

# Wait for the port to accept connections and /health to return 200.
last_code=""
last_curl_err=""
for _ in $(seq 1 45); do
  set +e
  last_code="$(curl -sS -o /tmp/po-health.json -w "%{http_code}" \
    --connect-timeout 2 --max-time 5 "${HEALTH_URL}" 2>/tmp/po-health.err)"
  curl_rc=$?
  set -e
  last_curl_err="$(cat /tmp/po-health.err 2>/dev/null || true)"

  if [[ "${curl_rc}" -eq 0 && "${last_code}" == "200" ]]; then
    echo "[deploy-api] Local /health → 200"
    exit 0
  fi

  state="$(sudo systemctl is-active projectours-api || true)"
  if [[ "${state}" == "failed" || "${state}" == "inactive" ]]; then
    echo "[deploy-api] projectours-api became ${state} while waiting for ${HEALTH_URL} (HTTP=${last_code:-none}, curl_rc=${curl_rc})" >&2
    [[ -n "${last_curl_err}" ]] && printf '%s\n' "${last_curl_err}" >&2
    dump_unit_logs
    exit 1
  fi

  sleep 1
done

echo "[deploy-api] local ${HEALTH_URL} did not return HTTP 200 within 45s (last HTTP=${last_code:-none}, curl_rc=${curl_rc:-n/a}). Connection refused usually means nothing is listening on 5280 — check ASPNETCORE_URLS and journal below." >&2
[[ -n "${last_curl_err}" ]] && printf '%s\n' "${last_curl_err}" >&2
dump_unit_logs
exit 1
REMOTE

if [[ "${SKIP_PUBLIC_HEALTH:-0}" != "1" ]]; then
  if [[ -z "${PUBLIC_API_BASE_URL:-}" ]]; then
    log "PUBLIC_API_BASE_URL unset — discovering Quick Tunnel URL from journal"
    PUBLIC_API_BASE_URL="$(ssh "${SSH_OPTS[@]}" "${SSH_USER_HOST}" \
      "sudo journalctl -u cloudflared-quick -n 80 --no-pager 2>/dev/null | grep -oE 'https://[a-z0-9-]+\\.trycloudflare\\.com' | tail -1" \
      || true)"
  fi
  if [[ -z "${PUBLIC_API_BASE_URL:-}" ]]; then
    die "Could not resolve PUBLIC_API_BASE_URL (set it or ensure cloudflared-quick is logging a trycloudflare URL). Use SKIP_PUBLIC_HEALTH=1 only for local-only deploys."
  fi
  PUBLIC_API_BASE_URL="${PUBLIC_API_BASE_URL%/}"
  log "Health check (public) ${PUBLIC_API_BASE_URL}/health"
  PUBLIC_CODE="$(curl -sS -o /dev/null -w "%{http_code}" \
    "${PUBLIC_API_BASE_URL}/health" || true)"
  [[ "${PUBLIC_CODE}" == "200" ]] || die "public /health returned HTTP ${PUBLIC_CODE} (expected 200)"
  log "Public /health → 200"
else
  log "SKIP_PUBLIC_HEALTH=1 — skipping public health"
fi

log "Deploy OK"
