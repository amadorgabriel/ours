#!/usr/bin/env bash
# Sobe API, web e o Metro do development build com o env do runtime.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${OURS_DEV_STATE_DIR:-/tmp/ours-dev-stack}"
PY="${PYTHON:-python3}"
PATH_EXPORT="$(printf '%q' "$PATH")"
mkdir -p "$STATE_DIR"

log() { printf '%s\n' "$*" >&2; }

if [[ -f /exec-daemon/tmux.portal.conf ]]; then
  TMUX=(tmux -f /exec-daemon/tmux.portal.conf)
else
  TMUX=(tmux)
fi

tmux_start() {
  local session="$1"
  shift
  if "${TMUX[@]}" has-session -t "=$session" 2>/dev/null; then
    "${TMUX[@]}" kill-session -t "=$session"
  fi
  "${TMUX[@]}" new-session -d -s "$session" -- bash -lc "export PATH=$PATH_EXPORT; $*"
}

port_open() {
  "$PY" - "$1" <<'PY'
import socket, sys
port = int(sys.argv[1])
sock = socket.socket()
sock.settimeout(0.4)
try:
    sock.connect(("127.0.0.1", port))
except OSError:
    sys.exit(1)
finally:
    sock.close()
PY
}

wait_http() {
  local url="$1" attempts="${2:-90}"
  local i
  for i in $(seq 1 "$attempts"); do
    if curl -fsS -o /dev/null "$url" 2>/dev/null; then
      return 0
    fi
    sleep 1
  done
  log "Sem resposta de $url"
  return 1
}

ensure_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    command -v cloudflared
    return
  fi
  local bin="$STATE_DIR/cloudflared"
  if [[ ! -x "$bin" ]]; then
    log "Baixando cloudflared…"
    curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64" -o "$bin"
    chmod +x "$bin"
  fi
  printf '%s\n' "$bin"
}

start_tunnel() {
  local name="$1" port="$2" bin="$3"
  local session="ours-tunnel-${name}"
  local logfile="$STATE_DIR/tunnel-${name}.log"
  : >"$logfile"
  tmux_start "$session" "exec $(printf '%q' "$bin") tunnel --url http://127.0.0.1:${port} --no-autoupdate > $(printf '%q' "$logfile") 2>&1"
  local url="" i
  for i in $(seq 1 45); do
    url="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$logfile" | tail -1 || true)"
    if [[ -n "$url" ]]; then
      printf '%s\n' "$url"
      return 0
    fi
    sleep 1
  done
  log "Túnel ${name} não publicou URL. Log: $logfile"
  return 1
}

if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  log "PostgreSQL não está aceitando conexões em localhost:5432."
  log "A API em Development aplica as migrations ao subir."
  exit 1
fi

DETECT="$("$PY" "$SKILL_DIR/dev_env.py" --root "$ROOT" --dry-run)"
RUNTIME="$(printf '%s' "$DETECT" | "$PY" -c 'import json,sys; print(json.load(sys.stdin)["runtime"])')"
log "Runtime: $RUNTIME"

if ! curl -fsS -o /dev/null "http://127.0.0.1:5280/health"; then
  log "Subindo API em 0.0.0.0:5280 (Development)…"
  tmux_start ours-api "cd $(printf '%q' "$ROOT") && ASPNETCORE_ENVIRONMENT=Development dotnet run --project server/src/ProjectOurs.API --no-launch-profile --urls http://0.0.0.0:5280"
  wait_http "http://127.0.0.1:5280/health" 120
else
  log "API já responde em :5280"
fi

API_PUBLIC=""
WEB_PUBLIC=""
PREPARE=( "$PY" "$SKILL_DIR/dev_env.py" --root "$ROOT" )
if [[ "$RUNTIME" == "cloud" ]]; then
  CF="$(ensure_cloudflared)"
  API_PUBLIC="$(start_tunnel api 5280 "$CF")"
  WEB_PUBLIC="$(start_tunnel web 3000 "$CF")"
  PREPARE+=(--api-public-base "$API_PUBLIC" --web-public-base "$WEB_PUBLIC")
fi
"${PREPARE[@]}" >/dev/null

log "Subindo web em 0.0.0.0:3000…"
tmux_start ours-web "cd $(printf '%q' "$ROOT/web") && npm run dev -- --hostname 0.0.0.0 --port 3000"
wait_http "http://127.0.0.1:3000/login" 120

if [[ "$RUNTIME" == "cloud" ]]; then
  if ! (cd "$ROOT/mobile" && node -e "require.resolve('@expo/ngrok/package.json')") >/dev/null 2>&1; then
    log "Instalando @expo/ngrok no node_modules, sem alterar package.json…"
    cp "$ROOT/mobile/package.json" "$STATE_DIR/package.json.bak"
    cp "$ROOT/mobile/package-lock.json" "$STATE_DIR/package-lock.json.bak"
    (cd "$ROOT/mobile" && npm install --no-save @expo/ngrok@4.1.0)
    cp "$STATE_DIR/package.json.bak" "$ROOT/mobile/package.json"
    cp "$STATE_DIR/package-lock.json.bak" "$ROOT/mobile/package-lock.json"
  fi
  METRO_CMD="npx expo start --dev-client --tunnel --port 8081 --clear"
else
  METRO_CMD="npx expo start --dev-client --host lan --port 8081 --clear"
fi
log "Subindo Metro ($METRO_CMD)…"
tmux_start ours-metro "cd $(printf '%q' "$ROOT/mobile") && EXPO_NO_TELEMETRY=1 $METRO_CMD"

PLAN_ARGS=( "$PY" "$SKILL_DIR/dev_env.py" --root "$ROOT" --dry-run )
if [[ -n "$API_PUBLIC" ]]; then
  PLAN_ARGS+=(--api-public-base "$API_PUBLIC" --web-public-base "$WEB_PUBLIC")
fi
"${PLAN_ARGS[@]}" | tee "$STATE_DIR/plan.json"

log "Aguardando a URL do development build no Metro…"
DEVICE_URL=""
for _ in $(seq 1 40); do
  pane="$("${TMUX[@]}" capture-pane -t ours-metro -p -S -200 || true)"
  joined="$(printf '%s' "$pane" | tr -d '\n[:space:]')"
  DEVICE_URL="$(printf '%s' "$joined" | grep -oE 'exp\+project-ours://[^[:space:]]+' | head -1 || true)"
  if [[ -n "$DEVICE_URL" ]]; then
    break
  fi
  if printf '%s' "$pane" | grep -q 'Waiting on http'; then
    break
  fi
  sleep 2
done
if [[ -n "$DEVICE_URL" ]]; then
  log "Development build no aparelho: $DEVICE_URL"
else
  log "O QR ainda está na sessão tmux ours-metro."
fi
