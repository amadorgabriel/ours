---
name: run-dev-stack
description: >-
  Sobe o Project Ours (API, web e Metro do development build) em máquina local
  ou no Cloud Agent. Ajusta IP, túneis e variáveis para login Google no
  navegador e no app instalado no aparelho. Use quando pedirem para rodar o
  ambiente, subir web e mobile, development build, dev client, ou login Google
  no celular.
---

# Rodar web + development build

O navegador entra com Google na origem do web. O aparelho entra com Google no app **Ours** já instalado como development build (não é Expo Go) e chama a API num endereço que ele alcança.

## Obrigatório

1. PostgreSQL aceitando `localhost:5432` (a API em Development migra ao subir).
2. Development build do app já instalado no aparelho (`com.projectours.app`). Este skill não dispara `eas build`.
3. No Google Cloud Console, o client Web de `server/src/ProjectOurs.API/appsettings.json` precisa ter a origem JavaScript que o script imprimir em `googleJavaScriptOrigin`. `http://localhost:3000` cobre a máquina local. Um túnel novo precisa ser acrescentado antes do botão Google funcionar.

## Comandos

Na raiz do repositório:

```bash
python3 .cursor/skills/run-dev-stack/scripts/test_dev_env.py
bash .cursor/skills/run-dev-stack/scripts/up.sh
```

`up.sh` detecta o runtime, grava `web/.env.local` e `mobile/.env.local` (não commitar), sobe API `:5280`, web `:3000` e Metro `:8081` em tmux (`ours-api`, `ours-web`, `ours-metro`). No cloud também sobe `ours-tunnel-api` e `ours-tunnel-web`.

Override quando a detecção errar:

```bash
OURS_DEV_RUNTIME=local OURS_LAN_IP=192.168.1.20 bash .cursor/skills/run-dev-stack/scripts/up.sh
```

## O que cada runtime grava

| | Local | Cloud Agent |
| --- | --- | --- |
| Web | `OURS_API_ORIGIN=http://127.0.0.1:5280` e `NEXT_PUBLIC_API_URL` vazio, para o browser usar `/api` na mesma origem | Igual. O usuário abre a URL `https://….trycloudflare.com/login` |
| Celular | `EXPO_PUBLIC_API_URL=http://<IP-da-LAN>:5280/api` | `EXPO_PUBLIC_API_URL=https://<túnel-da-api>/api` |
| Metro | `expo start --dev-client --host lan` | `expo start --dev-client --tunnel` |
| Convite | `http://<IP-da-LAN>:3000/join` | `https://<túnel-do-web>/join` |

Os client IDs Google (Web e Android) saem de `appsettings.json`. `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` já preenchido é preservado.

Cloud é `/exec-daemon`, cgroup `cursor-agent/workload`, ou `OURS_DEV_RUNTIME=cloud`. O IP da pod (`172.30.x`) não vai para o aparelho.

## Como a pessoa entra

- **Web:** abra `loginPath` do JSON impresso. No computador isso é `http://localhost:3000/login`. Use `localhost`, não `127.0.0.1`: o Google trata os dois como origens diferentes. O botão só entra se essa origem estiver no client Web. A sessão usa cookie na mesma origem; o browser chama `/api` no Next, que encaminha para `OURS_API_ORIGIN`.
- **Aparelho:** abra o app Ours (dev client), mesma rede Wi-Fi no modo local, e escaneie o QR da sessão tmux `ours-metro`. O login Google nativo usa o Web client ID gravado no bundle. Se o botão falhar no Android, o SHA-1 do keystore **desse** development build tem de estar no client Android do Google (`com.projectours.app`).

Para ver o QR de novo: `tmux attach -t ours-metro` (no cloud, `tmux -f /exec-daemon/tmux.portal.conf attach -t ours-metro`).

## Não fazer

- Não commitar `.env.local`.
- Não usar Expo Go.
- Não colocar `localhost` em `EXPO_PUBLIC_API_URL` quando quem chama é o aparelho.
- Não servir o web com `NEXT_PUBLIC_API_URL` apontando para outro host: o cookie `po_auth` é `SameSite=Lax` e o login Google no browser deixa de valer nas próximas chamadas.
