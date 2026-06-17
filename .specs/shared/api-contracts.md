# API Contracts (índice)

Contrato de domínio: [domain-model.md](domain-model.md) · Specs: `.specs/features/*/spec.md`

## Convenções

- Base: `/api`
- **Web:** cookie `po_auth` + antiforgery em mutações
- **Mobile:** `Authorization: Bearer {jwt}` (sem antiforgery)
- Escopo familiar: header `X-Family-Id: {uuid}`

## Endpoints — Auth

| Método | Rota | Escopo | Plataformas |
|--------|------|--------|-------------|
| POST | `/auth/google` | Público — `{ idToken }` | web, mobile |
| GET | `/auth/me` | Autenticado | web, mobile |
| POST | `/auth/logout` | Autenticado | web, mobile |
| GET | `/auth/antiforgery` | Público | web only |

## Endpoints — Family (M2)

| Método | Rota | Escopo | Status |
|--------|------|--------|--------|
| POST | `/families` | User | ✅ server |
| GET | `/families/my` | User | ✅ server |
| POST | `/invite` | Admin + `X-Family-Id` | ✅ server |
| POST | `/join` | User | ✅ server |

## Endpoints — Activities (M3)

| Método | Rota | Escopo | Status |
|--------|------|--------|--------|
| POST | `/activities/call` | Family + assistido | planejado |
| GET | `/activities/feed` | Family | planejado |
| GET | `/activities/calendar` | Family, query `month` | planejado |

## Endpoints — Goals (M4)

| Método | Rota | Escopo | Status |
|--------|------|--------|--------|
| POST | `/goals` | Family | planejado |
| GET | `/goals` | Family | planejado |
| POST | `/goals/{id}/contribute` | Family | planejado |

## Endpoints — Parents (M5)

| Método | Rota | Escopo | Status |
|--------|------|--------|--------|
| GET | `/parents` | Family | planejado |
| PUT | `/parents/{id}` | Admin | planejado |
| POST | `/parents/{id}/credentials` | Admin | planejado |
| POST | `/parents/{id}/attachments` | Admin | planejado |

## Coleção executável

`server/collections/bruno/` — preferir Bruno sobre Postman.

## Futuro

OpenAPI em `.specs/shared/contracts/openapi.yaml` quando API estabilizar.
