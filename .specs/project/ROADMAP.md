# Roadmap — Project Ours MVP

**Última atualização:** 2026-06-08

## Milestones

| # | Milestone | Status | Spec |
|---|-----------|--------|------|
| M0 | Fundação (back + front + standards) | Concluído | `.specs/archive/001-client-standards/` |
| M1 | Auth + onboarding + smart routing | Concluído | `.specs/features/auth/spec.md` |
| M2 | Gestão de família + convites | Em progresso | `.specs/features/family/spec.md` |
| M3 | Ligações + feed | Pendente | `.specs/features/activities/spec.md` |
| M4 | Metas financeiras | Pendente | `.specs/features/goals/spec.md` |
| M5 | Estatísticas pessoais + dados dos pais | Pendente | `.specs/features/profile/spec.md` |

## Entregue

- [x] Setup backend .NET 8 + PostgreSQL + testes
- [x] Setup frontend Next.js 16 + tooling (ESLint, Prettier, Husky, Vitest)
- [x] Design tokens + tema Mantine
- [x] Client standards (domain, infra, presentation, ui)
- [x] Auth: login Google, logout, session restore, route guards, cookie `po_auth`
- [x] Smart routing pós-login (onboarding / dashboard / family select)
- [x] Coleção Bruno em `server/collections/bruno/` (auth)

## Em andamento

- [ ] **004-family-management** — criar família, convites 24h, join, seletor multi-família (`.specs/changes/004-family-management/`)

## Próximo

1. Executar tasks T1–T20 de `004-family-management`
2. Smoke test manual: criar família → convite → join (2 usuários)
3. Especificar M3 (ligações + feed)
