# API Contracts (índice)

Contrato completo: `_docs/product-requirements-document.md` §6.

## Convenções

- Base: `/api`
- Auth: cookie `po_auth` (browser); antiforgery em mutações
- Escopo familiar: header `X-Family-Id: {uuid}`

## Endpoints MVP

| Método | Rota | Escopo |
|--------|------|--------|
| POST | `/auth/google` | Público |
| GET | `/auth/antiforgery` | Autenticado |
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
