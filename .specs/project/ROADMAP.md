# Roadmap — Project Ours MVP

**Última atualização:** 2026-06-16

**Plataformas:** ver `.specs/shared/platforms.md` — mobile (principal, futuro), web (admin PWA, fase ponte).

## Milestones

| # | Milestone | Plataforma (alvo) | Status | Spec |
|---|-----------|-------------------|--------|------|
| M0 | Fundação (back + web + standards) | web + server | Concluído | `.specs/archive/001-client-standards/` |
| M0.5 | Platform split (`client` → `web`, placeholder `mobile`) | monorepo | Concluído | `.specs/changes/006-client-platform-split/` |
| M1 | Auth + onboarding + smart routing | web (ponte) | Concluído | `.specs/features/auth/spec.md` |
| M2 | Gestão de família + convites | web (ponte) | Em progresso | `.specs/features/family/spec.md` |
| M3 | Ligações + feed | mobile (web na ponte) | Pendente | a especificar |
| M4 | Metas financeiras | mobile (web na ponte) | Pendente | a especificar |
| M5 | Estatísticas pessoais + dados dos pais | mobile + web admin | Pendente | a especificar |
| M6 | App mobile M0 | mobile | Pendente | a especificar |

## Entregue

- [x] Setup backend .NET 8 + PostgreSQL + testes
- [x] Setup frontend Next.js 16 + tooling em `web/` (ex-`client/`)
- [x] Design tokens + tema Mantine (change 005 → `.specs/design/DESIGN.md`)
- [x] Client standards (domain, infra, presentation, ui)
- [x] Auth: login Google, logout, session restore, route guards, cookie `po_auth`
- [x] Smart routing pós-login (onboarding / dashboard / family select)
- [x] Coleção Bruno em `server/collections/bruno/` (auth)

## Em andamento

- [ ] **004-family-management** — criar família, convites 24h, join, seletor multi-família (`.specs/changes/004-family-management/`)

## Concluído recentemente

- [x] **006-client-platform-split** — `client/` → `web/`, placeholder `mobile/` (`.specs/changes/006-client-platform-split/`)

## Próximo

1. Executar tasks T1–T20 de `004-family-management` em `web/`
2. Smoke test manual: criar família → convite → join (2 usuários)
3. Especificar M6 (mobile M0) e M3 (ligações + feed)
