# Tech Stack — Web

**Pacote:** `web/` · **Papel:** PWA admin/suporte (fase ponte: MVP completo)  
**Última atualização:** 2026-06-17

## Runtime

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5 |
| UI | Mantine + Tailwind | 9 / 4 |
| Icons | Tabler Icons | — |
| i18n | next-intl | 4 (`pt-BR`, `localePrefix: 'never'`) |
| State | Context API (auth, family) | — |
| Data | TanStack Query + Axios | 5 |
| Validation | Zod | 4 |
| Tests | Vitest + RTL | 4 |
| Hooks | Husky (pre-commit, pre-push) | 9 |

## Auth

- Google OAuth via `@react-oauth/google`
- Cookie HttpOnly `po_auth` + antiforgery em mutações
- Session restore: `GET /auth/me`

## Gate

```bash
cd web && npm run pre-push:checks
```

## Referências

- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Convenções: [CONVENTIONS.md](CONVENTIONS.md)
- Design: [`.specs/design/DESIGN.md`](../../design/DESIGN.md) §6 (web admin)
- Skill: `.cursor/skills/ours-client-standard/`
