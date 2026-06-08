# State — Project Ours

Memória persistente entre sessões. Atualizar ao registrar decisões, bloqueios ou lições.

## Decisões

| Data | Decisão | Motivo |
|------|---------|--------|
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
| ec-v3-ui | Referência em `c:\_git\job\ec\ec-v3-ui` — client/ reestruturado para parity |

## Lições

- Stubs de onboarding/select bloqueiam demo até M2 — priorizar vertical slice família antes de activities
- Prompts de setup duplicavam conventions — manter tooling só em `codebase/CONVENTIONS.md`

## Deferred

- Playwright E2E (após M2 estável)
- PWA offline avançado
- OpenAPI em `shared/contracts/`
- Cadastro Parent no onboarding (M5)

## Todos (sessão)

- [ ] Implementar T1–T20 em `feat/004-family-management`

## Preferences

- Responder em português
- Fluxo: ler `.specs` → tasks → implementar → testes
