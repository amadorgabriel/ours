# Tasks — Change 003 Login / Logout

**Spec:** `.specs/changes/003-login-logout-flow/spec.md`  
**Design:** `.specs/changes/003-login-logout-flow/design.md`  
**Gate:** `cd client && npm run pre-push:checks` + `cd server && dotnet build`

## Execution Plan

```
Phase 1 — Foundation
  T1 [P]  i18n auth namespace
  T2 [P]  domain + contract extensions
  T3      Google OAuth provider

Phase 2 — Use cases
  T4 [P]  get-session.usecase + test
  T5 [P]  logout.usecase + test
  T6      hooks useSession + useLogout + mock updates

Phase 3 — UI & routes
  T7 [P]  LoginPage module
  T8      next.config rewrite (dev)
  T9      routes (auth)/login + stub (app) pages
  T10     AuthGuard + GuestGuard
  T11     AuthProvider session bootstrap
  T12     AppShellStub com logout
  T13     Home CTA → /login

Phase 4 — Server
  T14     AuthController + cookie auth
  T15     CORS credentials + Google validation stub

Phase 5 — Integration
  T16     Manual smoke test checklist
```

## Granularity Check

| Task | Atomic? | One deliverable |
|------|---------|-----------------|
| T1–T15 | ✅ | Um arquivo/conceito por task |
| T16 | ✅ | Checklist verificável |

## Diagram-Definition Cross-Check

| Task | Depends on | In diagram |
|------|------------|------------|
| T1 | — | Phase 1 |
| T2 | — | Phase 1 |
| T3 | T2 | Phase 1 |
| T4 | T2 | Phase 2 |
| T5 | T2 | Phase 2 |
| T6 | T4, T5 | Phase 2 |
| T7 | T1, T3, T6 | Phase 3 |
| T8 | — | Phase 3 |
| T9 | T7, T10 | Phase 3 |
| T10 | T6, T11 | Phase 3 |
| T11 | T6 | Phase 3 |
| T12 | T5, T6 | Phase 3 |
| T13 | T9 | Phase 3 |
| T14 | T2 | Phase 4 |
| T15 | T14 | Phase 4 |
| T16 | T9, T14, T15 | Phase 5 |

## Test Co-location Validation

| Task | Layer | Tests in Done When | TESTING.md |
|------|-------|-------------------|------------|
| T4 | usecase | `get-session.usecase.test.ts` | unit ✅ |
| T5 | usecase | `logout.usecase.test.ts` | unit ✅ |
| T6 | hooks | extend existing pattern | unit ✅ |
| T10 | guard | `auth-guard.test.tsx` | unit ✅ |
| T11 | provider | optional provider test | unit ✅ |
| T14 | server | controller integration (future) | gate: dotnet build |

---

## Tasks

### T1: i18n namespace `auth` [P]

- **What:** Strings de login, logout, loading de sessão
- **Where:** `client/src/i18n/messages/pt-BR.json`
- **Depends on:** —
- **Done when:** Keys usadas sem string hardcoded nos módulos auth
- **Gate:** `npm run type-check`
- **Status:** Done

### T2: Estender domain auth [P]

- **What:** Adicionar `getSession` e `logout` em `IAuth`; tipos se necessário
- **Where:** `client/src/core/domain/auth/`
- **Depends on:** —
- **Done when:** Contract compila; exports atualizados
- **Gate:** `npm run type-check`
- **Status:** Done

### T3: Google OAuth provider

- **What:** Instalar `@react-oauth/google`; criar provider; wrap em `RootProvider`
- **Where:** `presentation/providers/google-oauth/`, `package.json`, `.env.example`
- **Depends on:** T2
- **Done when:** App renderiza com `GoogleOAuthProvider` sem erro
- **Gate:** `npm run build`
- **Status:** Done

### T4: get-session use case [P]

- **What:** `AuthGetSessionUseCase` → `GET /auth/me`
- **Where:** `core/services/usecases/auth/get-session.usecase.ts` + test
- **Depends on:** T2
- **Done when:** Test passa com mock 200/401
- **Gate:** `npm run test:run -- get-session`
- **Status:** Done

### T5: logout use case [P]

- **What:** `AuthLogoutUseCase` → `POST /auth/logout`
- **Where:** `core/services/usecases/auth/logout.usecase.ts` + test
- **Depends on:** T2
- **Done when:** Test passa com mock
- **Gate:** `npm run test:run -- logout`
- **Status:** Done

### T6: Hooks useSession + useLogout

- **What:** React Query session bootstrap; mutation logout com side effects
- **Where:** `index.hooks.ts`, `index.mock.ts`, `query-keys.ts`
- **Depends on:** T4, T5
- **Done when:** Hooks exportados; mocks `/auth/me` e `/auth/logout`
- **Gate:** `npm run test:run -- auth`
- **Status:** Done

### T7: LoginPage module [P]

- **What:** Tela login com GoogleLogin, loading, erro, redirect pós-sucesso
- **Where:** `presentation/modules/auth/login/`
- **Depends on:** T1, T3, T6
- **Done when:** Click login → mutation → redirect (mock)
- **Gate:** `npm run lint`
- **Status:** Done

### T8: next.config API rewrite

- **What:** Rewrite `/api/:path*` → backend em dev
- **Where:** `client/next.config.ts`
- **Depends on:** —
- **Done when:** Request `/api/health` proxied em dev
- **Gate:** manual dev
- **Status:** Done

### T9: Rotas app

- **What:** `(auth)/login`, `(app)/dashboard`, `/onboarding`, `/families/select` stubs
- **Where:** `client/src/app/[locale]/`
- **Depends on:** T7, T10
- **Done when:** Navegação entre rotas funciona
- **Gate:** `npm run build`
- **Status:** Done

### T10: AuthGuard + GuestGuard

- **What:** Client guards com loading state
- **Where:** `presentation/modules/auth/auth-guard/`, `guest-guard/`
- **Depends on:** T6, T11
- **Done when:** Test redirect logic; wired em layouts
- **Gate:** `npm run test:run -- guard`
- **Status:** Done

### T11: AuthProvider session bootstrap

- **What:** Integrar `useSession`; expor `isLoading`; auto familyId
- **Where:** `presentation/providers/auth/`
- **Depends on:** T6
- **Done when:** Reload com mock session restaura estado
- **Gate:** `npm run test:run`
- **Status:** Done

### T12: AppShellStub + logout button

- **What:** Layout mínimo `(app)` com header e "Sair"
- **Where:** `presentation/modules/app-shell/`, `(app)/layout.tsx`
- **Depends on:** T5, T6
- **Done when:** Logout redireciona para login
- **Gate:** manual
- **Status:** Done

### T13: Home → link login

- **What:** CTA Google vira Link para `/login` ou redirect
- **Where:** `presentation/modules/home/`
- **Depends on:** T9
- **Done when:** Home não dispara OAuth diretamente
- **Gate:** `npm run lint`
- **Status:** Done

### T14: Server AuthController

- **What:** Endpoints google/me/logout/antiforgery + cookie `po_auth`
- **Where:** `server/src/ProjectOurs.API/`
- **Depends on:** T2
- **Done when:** Bruno/curl login retorna Set-Cookie
- **Gate:** `dotnet build`
- **Status:** Done

### T15: Server CORS + Google validation

- **What:** AllowCredentials; validação idToken (stub dev aceita token test)
- **Where:** `Program.cs`, Application layer
- **Depends on:** T14
- **Done when:** Client dev consegue login real cross-origin ou via rewrite
- **Gate:** `dotnet build`
- **Status:** Done

### T16: Smoke test manual

- **What:** Checklist: login → dashboard → reload → logout → blocked app
- **Where:** —
- **Depends on:** T9, T14, T15
- **Done when:** Checklist marcado na PR/descrição
- **Gate:** manual
- **Status:** Pending

---

## Parallelization

| Tasks | Can run in parallel |
|-------|---------------------|
| T1 + T2 + T8 | Yes |
| T4 + T5 | Yes (after T2) |
| T7 + T12 | Partial (after T6) |
| T14 + T7 | No — prefer server before full manual |

## Estimated effort

~2–3 sessões de agente (client-heavy + server cookie auth).
