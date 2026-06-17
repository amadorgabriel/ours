# Roadmap — Project Ours MVP

**Última atualização:** 2026-06-17

**Plataformas:** `.specs/shared/platforms.md` — mobile (principal), web (admin + ponte), server (API única)

## Milestones

| # | Milestone | Mobile | Web | Server | Status | Spec |
|---|-----------|--------|-----|--------|--------|------|
| M0 | Fundação + standards | — | ✅ | ✅ | Concluído | `archive/001-client-standards/` |
| M0.5 | Platform split | placeholder | ✅ | — | Concluído | `archive/006-client-platform-split/` |
| M1 | Auth + smart routing | spec | ✅ | ✅ | Concluído | `features/auth/` |
| M2 | Gestão família + convites | spec | em progresso | ✅ | Em progresso | `features/family/` |
| M3 | Ligações + feed + calendário | — | ponte | planejado | Pendente | a especificar |
| M4 | Metas financeiras | — | ponte | planejado | Pendente | a especificar |
| M5 | Dados assistido + credenciais + anexos | — | admin | planejado | Pendente | a especificar |
| M6 | App mobile M0 (auth + family) | implementar | — | Bearer auth | Pendente | `features/*/mobile.md` |

## Specs por plataforma

| Feature | Produto | Web | Mobile |
|---------|---------|-----|--------|
| Auth | `features/auth/spec.md` | `features/auth/web.md` ✅ | `features/auth/mobile.md` |
| Family | `features/family/spec.md` | `features/family/web.md` | `features/family/mobile.md` |

## Entregue

- [x] Backend .NET 8 + PostgreSQL + testes
- [x] Frontend Next.js 16 em `web/` (ex-`client/`)
- [x] Design tokens + tema (`.specs/design/DESIGN.md`)
- [x] Design mobile especificado (`.specs/design/mobile.md`)
- [x] Estrutura `.specs/` com 3 frentes (`platforms/`)
- [x] Stack mobile definida (Expo + RN)
- [x] Arquitetura server documentada
- [x] Auth web end-to-end
- [x] Bruno collections (auth)

## Em andamento

- [ ] **M2 Family** — criar família, convites, join, seletor (`features/family/web.md`)
- [ ] Server endpoints family (parcialmente pronto)

## Próximo

1. Concluir M2 family no `web/`
2. Smoke: criar família → convite → join (2 usuários)
3. **M6:** scaffold Expo em `mobile/` + auth mobile + family mobile
4. Especificar M3 (ligações + feed + calendário)

## Arquitetura e stack

| Frente | Docs |
|--------|------|
| Mobile | `.specs/platforms/mobile/` + `.specs/design/mobile.md` |
| Web | `.specs/platforms/web/` + `.specs/design/DESIGN.md` §6 |
| Server | `.specs/platforms/server/` |
