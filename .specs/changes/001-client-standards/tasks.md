# Tasks — 001 Client Standards

**Spec:** `.specs/changes/001-client-standards/spec.md`
**Conventions:** `.specs/codebase/CONVENTIONS.md`
**Skill:** `.cursor/skills/ours-client-standard/`

**Gate global:** `cd client && npm run pre-push:checks`

## Execution Plan

```
T1 [audit] → T2 [http] → T3 [auth-layers] → T4 [eslint] → T5 [verify]
```

## Tasks

### T1: Auditoria estrutural

- **What:** Script ou checklist documentado comparando `client/src` vs CONVENTIONS
- **Where:** `.specs/changes/001-client-standards/audit.md` (resultado)
- **Depends on:** —
- **Done when:** Gaps listados com paths; nenhum gap crítico sem ID STD-*
- **Gate:** revisão manual
- **Status:** Complete

### T2: HTTP client padrão Ours

- **What:** Refatorar `core/infrastructure/http/client.ts` — `withCredentials`, antiforgery helper, interceptor `X-Family-Id`, 401 redirect
- **Where:** `client/src/core/infrastructure/http/`
- **Depends on:** T1
- **Done when:** STD-01 a STD-04 atendidos; testes unitários do interceptor
- **Tests:** `client.ts` + `client.test.ts`
- **Gate:** `npm run test:run`
- **Status:** Complete

### T3: Módulo auth — 4 camadas mínimas

- **What:** Esqueleto completo auth: portas, gateway, use case `getAntiforgeryToken`, presentation hook
- **Where:** `client/src/modules/auth/`
- **Depends on:** T2
- **Done when:** STD-05; `index.ts` exporta API pública; testes gateway existentes passam
- **Gate:** `npm run test:run`
- **Status:** Complete

### T4: ESLint — regras de boundaries (opcional mínimo)

- **What:** `no-restricted-imports` impedindo `domain` → `infrastructure` e `page.tsx` → axios direto
- **Where:** `client/eslint.config.mjs`
- **Depends on:** T3
- **Done when:** `npm run lint` passa; violações óbvias falham
- **Gate:** `npm run lint`
- **Status:** Complete

### T5: Verificação final + atualizar STATE

- **What:** Rodar gates, marcar STD-* como Verified, atualizar ROADMAP M0
- **Where:** `.specs/project/STATE.md`, `tasks.md` (status)
- **Depends on:** T4
- **Done when:** `pre-push:checks` verde; tasks T1–T5 Complete
- **Gate:** `npm run pre-push:checks`
- **Status:** Complete
