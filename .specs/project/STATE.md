# State — Project Ours

Memória persistente entre sessões. Atualizar ao registrar decisões, bloqueios ou lições.

## Decisões

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-06-16 | **Breaking:** `client/` → `web/`; `mobile/` placeholder; server/DB intocados | Cliente principal será mobile; web vira PWA admin opcional (change 006) |
| 2026-06-16 | Fase ponte confirmada: `web/` mantém MVP completo até mobile M0 | Evita produto sem interface utilizável |
| 2026-06-16 | Rotas web sem `[locale]`: `localePrefix: 'never'`, URLs diretas | Fix 404 em `/` quando proxy não reescrevia; MVP monolíngue |
| 2026-06-16 | Change 005 concluído; DESIGN.md v1.2.0 canonical | Tokens + retema mergeados em feat/005 |
| 2026-06-10 | Change 005: DESIGN.md v1.0.0 em `.specs/design/` | Fonte única para UI; ref Freud.ai adaptada para Ours |
| 2026-06-10 | Paleta orgânica brown/green/orange/cream; Urbanist | Alinha empatia do produto; substitui tema blue/Geist |
| 2026-06-10 | Wave Tab Bar spec-only até M3+ | Bottom nav ainda não existe |
| 2026-06-08 | Change 004: onboarding só nome da família; pais em M5 | Reduz escopo M2 |
| 2026-06-08 | Change 004: convite 6 chars A-Z0-9, 24h, múltiplos pendentes | Alinhado entidade `FamilyInvite` + PROJECT.md |
| 2026-06-08 | Change 004: refresh sessão auth após create/join | `familyCount` vem de `/auth/me` |
| 2026-06-08 | M0 + M1 concluídos; changes 001–003 arquivados | Fundação + auth end-to-end mergeados |
| 2026-06-08 | Change 003: `@react-oauth/google`, `/login` dedicado, guards client-side | Ver `archive/003-login-logout-flow/context.md` |
| 2026-06-08 | Specs consolidadas em `.specs/` (híbrido Open Spec + TLC) | `_docs/` tinha PRD duplicado |
| 2026-05 | Auth via cookie HttpOnly `po_auth`, não Bearer no browser | Segurança + CSRF com antiforgery |
| 2026-05 | Multi-família via `FamilyMembership` + `X-Family-Id` | PRD v1.1 |
| 2026-05 | Vitest único (sem Jest paralelo) | Menos cerimônia |

## Bloqueios

| Item | Detalhe |
|------|---------|
| ec-v3-ui | Referência em `c:\_git\job\ec\ec-v3-ui` — `web/` reestruturado para parity |
| Mobile stack TBD | Placeholder em `mobile/`; change dedicado necessário antes de M6 |

## Lições

- Stubs de onboarding/select bloqueiam demo até M2 — priorizar vertical slice família antes de activities
- Prompts de setup duplicavam conventions — manter tooling só em `codebase/CONVENTIONS.md`
- Renomear cedo (`web/`) evita agentes e devs tratarem PWA como produto principal

## Deferred

- Playwright E2E (após M2 estável)
- PWA offline avançado
- OpenAPI em `shared/contracts/`
- Cadastro Parent no onboarding (M5)
- Stack e auth strategy do `mobile/`
- Poda de consumer features do `web/` (pós-mobile M0)
- Convite com link compartilhável + WhatsApp (notas SMOKE_RESULT)
- Admin revisualizar código de convite após fechar modal
- Definir pais/mãe no onboarding (notas SMOKE_RESULT)

## Todos (sessão)

- [x] T1–T2 change 006: rename `client/` → `web/` + gates
- [ ] Implementar T1–T20 em `feat/004-family-management` (paths `web/`)
- [x] Change 006 specs + docs atualizados
- [x] Implementar T1–T10 em change 005 (design tokens + retema)
- [x] Corrigir rotas web (`/` 404 → URLs diretas)

## Preferences

- Responder em português
- Fluxo: ler `.specs` → tasks → implementar → testes
