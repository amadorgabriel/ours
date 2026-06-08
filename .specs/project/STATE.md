# State — Project Ours

Memória persistente entre sessões. Atualizar ao registrar decisões, bloqueios ou lições.

## Decisões

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-06-08 | Change 003: `@react-oauth/google`, `/login` dedicado, guards client-side | Ver `003-login-logout-flow/context.md` |
| 2026-06-08 | Specs consolidadas em `.specs/` (híbrido Open Spec + TLC) | `_docs/` tinha PRD duplicado e prompts soltos |
| 2026-06-08 | `_docs/` deprecado; conteúdo canônico em `.specs/` | Uma fonte da verdade para agentes e humanos |
| 2026-05 | Auth via cookie HttpOnly `po_auth`, não Bearer no browser | Segurança + CSRF com antiforgery |
| 2026-05 | Multi-família via `FamilyMembership` + `X-Family-Id` | PRD v1.1 |
| 2026-05 | Vitest único (sem Jest paralelo) | Menos cerimônia, mesma API de testes |

## Bloqueios

| Item | Detalhe |
|------|---------|
| ec-v3-ui | Referência em `c:\_git\job\ec\ec-v3-ui` — client/ reestruturado para parity (domain, infra, services, presentation, ui). |

## Lições

- Prompts de setup (`frontend-setup-prompt.md`) duplicavam `client-standard.md` — manter tooling só em `codebase/CONVENTIONS.md`.
- PRD completo (1788 linhas) não deve ser carregado em toda sessão — usar feature specs com IDs rastreáveis.

## Deferred

- Playwright E2E (após auth estável)
- PWA offline avançado
- OpenAPI publicado em `shared/contracts/`

## Preferences

- Responder em português
- Fluxo: ler `.specs` → tasks → implementar → testes
