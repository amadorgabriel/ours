# Infra — Project Ours (change 035)

Deploy da API para a VM Oracle Always Free + Cloudflare Quick Tunnel.

| Artefato | Path |
|----------|------|
| Deploy script | [`deploy-api.sh`](./deploy-api.sh) |
| systemd unit | [`projectours-api.service`](./projectours-api.service) |
| GHA Deploy API | [`.github/workflows/deploy-api.yml`](../../.github/workflows/deploy-api.yml) |
| GHA Release APK | [`.github/workflows/release-apk.yml`](../../.github/workflows/release-apk.yml) |

## Deploy manual

```bash
export ORACLE_HOST=ubuntu@<vm-ip>
export ORACLE_SSH_KEY=$HOME/.ssh/id_ed25519_oracle
export NEON_CONNECTION_STRING='Host=...;Database=projectours;...;SSL Mode=Require'
# opcional — senão o script lê do journal cloudflared-quick:
# export PUBLIC_API_BASE_URL=https://<subdomain>.trycloudflare.com

./scripts/infra/deploy-api.sh
```

Flags: `SKIP_MIGRATE=1`, `SKIP_PUBLIC_HEALTH=1` (só se souber o que está fazendo).

**Health:** local `http://127.0.0.1:5280/health` e público `https://*.trycloudflare.com/health` (AD-012 — **não** `api.ours.app`).

---

## GitHub Secrets / Variables (Deploy API — T9)

Configure em **Settings → Secrets and variables → Actions** (repo). **Nunca** commitar valores.

### Obrigatórios (workflow `deploy-api.yml`)

| Nome | Tipo | Uso |
|------|------|-----|
| `ORACLE_SSH_KEY` | Secret | Conteúdo da chave privada SSH (PEM / OpenSSH) usada na VM |
| `ORACLE_HOST` | Secret | Destino SSH, ex.: `ubuntu@136.x.x.x` (verificar IP no Oracle Console — ephemeral) |
| `NEON_CONNECTION_STRING` | Secret | Connection string Neon com `SSL Mode=Require` (migrations no CI) |

### Opcional

| Nome | Tipo | Uso |
|------|------|-----|
| `PUBLIC_API_BASE_URL` | Variable (preferível) ou Secret | Base HTTPS do Quick Tunnel, ex.: `https://iso-….trycloudflare.com` **sem** path. Se vazio, o script descobre via `journalctl -u cloudflared-quick` |

### Já na VM (`/etc/projectours/env`) — não necessários no workflow

Estes ficam só na VM (chmod 600). O deploy **não** sobrescreve o env file.

| Nome (referência tasks.md) | Env na VM |
|----------------------------|-----------|
| `JWT_SIGNING_KEY` | `JwtSettings__SigningKey` |
| `GOOGLE_CLIENT_ID` | `Authentication__Google__ClientId` |
| `GOOGLE_ANDROID_CLIENT_ID` | `Authentication__Google__AndroidClientId` |

Template: [`server/.env.production.example`](../../server/.env.production.example).

### Checklist operador (T9)

1. [ ] Secret `ORACLE_SSH_KEY` (chave privada completa, incluindo headers)
2. [ ] Secret `ORACLE_HOST` (`ubuntu@<ip-atual>`)
3. [ ] Secret `NEON_CONNECTION_STRING`
4. [ ] (Opcional) Variable `PUBLIC_API_BASE_URL` com a URL trycloudflare atual
5. [ ] VM `RUNNING` + `projectours-api` + `cloudflared-quick` ativos
6. [ ] **Security List:** ingress TCP **22** com source `0.0.0.0/0` (MVP) — runners GHA usam IPs dinâmicos; `/32` só do operador → `Connection timed out` no rsync. Auth continua **só por chave** (`PasswordAuthentication no`). Não abrir **5280**.
7. [ ] Rodar **Actions → Deploy API → Run workflow** (ou push em `server/**` / `scripts/infra/**` em `main`)
8. [ ] Job `Test` green → job `Deploy` green → `/health` 200

**Nota:** IP Oracle muda se a VM for recriada — atualize `ORACLE_HOST`. URL Quick Tunnel muda se `cloudflared-quick` reiniciar — atualize `PUBLIC_API_BASE_URL` ou deixe vazio para auto-detect.

---

## GitHub Secrets (Release APK — T11, free tier)

Ver também [`mobile/README.md`](../../mobile/README.md) § Deploy / EAS.

| Nome | Tipo | Uso |
|------|------|-----|
| `EXPO_TOKEN` | Secret | Token Expo (`eas login` → Access Token) — **obrigatório** para o workflow |
| `ANDROID_KEYSTORE_BASE64` | Secret | Opcional se EAS gerencia credentials; necessário se signing local/CI próprio |
| `ANDROID_KEYSTORE_PASSWORD` | Secret | Idem |
| `ANDROID_KEY_ALIAS` | Secret | Idem |
| `ANDROID_KEY_PASSWORD` | Secret | Idem (se diferente da keystore) |

**EAS free tier (AD-013):** um build por vez; sem priority queue. Workflow serializado (`concurrency` group).

**EAS env (dashboard Expo ou `eas secret:`)** — não hardcodar `ours.app` enquanto AD-012:

| Env | Valor atual | Target futuro (com domínio) |
|-----|-------------|------------------------------|
| `EXPO_PUBLIC_API_URL` | `https://<subdomain>.trycloudflare.com/api` | `https://api.ours.app/api` |
| `EXPO_PUBLIC_INVITE_BASE_URL` | placeholder (deep link / trycloudflare) até Pages | `https://ours.app/join` |
