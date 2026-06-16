# Tech Stack

**Analyzed:** 2026-06-16 (atualizado change 006)

## Monorepo

| Pacote | Path | Função |
|--------|------|--------|
| Mobile | `mobile/` | App principal (placeholder — stack TBD) |
| Web | `web/` | PWA admin/suporte (ex-`client/`) |
| Server | `server/` | API REST .NET 8 |

Ver `.specs/shared/platforms.md` para matriz de features.

## Web (`web/`)

- Framework: Next.js 16.2.6 (App Router)
- Language: TypeScript 5
- UI: Mantine 9, Tailwind 4, Tabler Icons
- i18n: next-intl 4 (`pt-BR`)
- State: Zustand 5
- Data: TanStack Query 5, Axios
- Validation: Zod 4
- Tests: Vitest 4 + RTL + @vitest/ui
- Hooks: Husky 9 (pre-commit, pre-push)

## Mobile (`mobile/`)

- **Placeholder** — sem código de app
- Stack: TBD (change futuro)

## Server (`server/`)

- Runtime: .NET 8
- ORM: EF Core + PostgreSQL
- Tests: xUnit + WebApplicationFactory + Testcontainers
- API docs: Swagger (dev)

## Infra (planejado)

- Web PWA: Cloudflare
- Backend + DB: VPS Docker
