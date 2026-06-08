# API Contracts (índice)

Contrato completo: `.specs/shared/domain-model.md` · endpoints auth: `.specs/features/auth/spec.md`

## Convenções

- Base: `/api`
- Auth: cookie `po_auth` (browser); antiforgery em mutações
- Escopo familiar: header `X-Family-Id: {uuid}`

## Endpoints MVP

| Método | Rota | Escopo |
|--------|------|--------|
| POST | `/auth/google` | Público — body `{ idToken }`, response session + Set-Cookie `po_auth` |
| GET | `/auth/me` | Autenticado — restaura `AuthSessionModel` |
| POST | `/auth/logout` | Autenticado — expira cookie |
| GET | `/auth/antiforgery` | Público — token CSRF para mutações |
| POST | `/families` | User |
| GET | `/families/my` | User |
| POST | `/invite` | Admin + family |
| POST | `/join` | User |
| POST | `/activities/call` | Family |
| GET | `/activities/feed` | Family |
| POST | `/goals` | Family |
| POST | `/goals/{id}/contribute` | Family |

## Coleção executável

`server/collections/bruno/` — preferir Bruno sobre Postman.

## Futuro

OpenAPI em `.specs/shared/contracts/openapi.yaml` quando API estabilizar.
