# Smoke — Change 004 Family Management

Checklist manual end-to-end (dois usuários Google distintos).

## Pré-requisitos

- API em `http://localhost:5280` (`dotnet run` em `server/src/ProjectOurs.API`)
- Web em `http://localhost:3000` com `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- PostgreSQL com migrations aplicadas

## Fluxo A — Admin cria família

1. Login com **Usuário 1** (conta Google sem família).
2. Deve redirecionar para `/onboarding`.
3. Criar família com nome válido (ex.: `Família Silva`).
4. Deve redirecionar para `/dashboard`.
5. `GET /api/auth/me` deve retornar `familyCount: 1` e role `Admin`.

## Fluxo B — Admin gera convite

1. No dashboard, clicar **Convidar irmão** (visível só para Admin).
2. Gerar código; anotar código de 6 caracteres e validade 24h.
3. Copiar código (clipboard).

## Fluxo C — Irmão entra com código

1. Logout do Usuário 1.
2. Login com **Usuário 2** (outra conta Google, sem família).
3. Em `/onboarding`, usar **Tenho um código** com o código anotado.
4. Deve redirecionar para `/dashboard`.
5. `GET /api/auth/me` do Usuário 2 deve listar a família com role `Member`.

## Fluxo D — Multi-família (opcional)

1. Usuário 2 cria segunda família ou entra em outra via convite.
2. Com `familyCount > 1`, login deve ir para `/families/select`.
3. Selecionar família → dashboard com contexto `X-Family-Id` correto.

## Erros esperados (sanidade)

| Ação | Resultado |
|------|-----------|
| Nome vazio no create | Validação client-side |
| Código inválido no join | Mensagem i18n (404) |
| Convite expirado (>24h) | Mensagem i18n (400) |
| Member tenta convidar | 403 / botão ausente no dashboard |

## Gates automatizados

```bash
cd web && npm run pre-push:checks
cd server && dotnet test
```
