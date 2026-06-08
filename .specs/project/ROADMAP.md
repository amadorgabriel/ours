# Roadmap — Project Ours MVP

**Última atualização:** 2026-06-08

## Milestones

| # | Milestone | Status | Spec |
|---|-----------|--------|------|
| M0 | Fundação (back + front + standards) | Em progresso | `.specs/changes/001-client-standards/` |
| M1 | Auth + onboarding + smart routing | Parcial | `.specs/features/auth/spec.md` |
| M2 | Gestão de família + convites | Pendente | `.specs/features/family/spec.md` |
| M3 | Ligações + feed | Pendente | `.specs/features/activities/spec.md` |
| M4 | Metas financeiras | Pendente | `.specs/features/goals/spec.md` |
| M5 | Estatísticas pessoais + dados dos pais | Pendente | `.specs/features/profile/spec.md` |

## Entregue

- [x] Setup backend .NET 8 + PostgreSQL + testes
- [x] Setup frontend Next.js 16 + tooling (ESLint, Prettier, Husky, Vitest)
- [x] Design tokens + tema Mantine
- [x] Módulo auth (parcial): smart routing, gateway, stubs de rotas
- [x] Coleção Bruno em `server/collections/bruno/`

## Em andamento

- [ ] **003-login-logout-flow** — login Google, logout, session restore, route guards (`.specs/changes/003-login-logout-flow/`)
- [ ] Auth server: cookie `po_auth` (JWT-only hoje)

## Próximo

1. Executar tasks T1–T16 de `003-login-logout-flow`
2. Smoke test manual auth end-to-end
3. Especificar e implementar família (US-002, US-003)
