# Change 003 — Login / Logout Specification

**Feature:** `.specs/features/auth/spec.md`  
**Context:** `.specs/changes/003-login-logout-flow/context.md`

## Problem Statement

Irmãos não conseguem entrar nem sair da aplicação. A infraestrutura de auth existe parcialmente, mas falta integração Google, telas, guards, restauração de sessão e logout — bloqueando todo o MVP.

## Goals

- [ ] Login Google end-to-end (idToken → API → cookie → sessão client)
- [ ] Smart routing pós-login (onboarding / dashboard / seleção de família)
- [ ] Sessão persiste após reload via `/auth/me`
- [ ] Logout limpa cookie e estado client
- [ ] Rotas `(app)` protegidas; `(auth)` inacessível quando já logado

## User Stories

### P1: Login com Google ⭐ MVP

**User Story**: As a sibling, I want to sign in with Google so that I can access my family's data securely.

**Acceptance Criteria**:

1. WHEN usuário acessa `/login` THEN system SHALL exibir botão "Entrar com Google"
2. WHEN usuário completa Google Sign-In THEN client SHALL enviar `idToken` para `POST /auth/google`
3. WHEN API responde 200 THEN server SHALL setar cookie HttpOnly `po_auth` e client SHALL armazenar `AuthSessionModel` no `AuthProvider`
4. WHEN login sucede THEN client SHALL redirecionar conforme `resolvePostLoginRoute(familyCount)`
5. WHEN login falha THEN system SHALL exibir mensagem de erro i18n sem expor detalhes técnicos
6. WHEN login sucede e `familyCount === 1` THEN system SHALL definir família ativa automaticamente

**Independent Test**: Mock HTTP + teste do módulo login; manual com API dev.

### P1: Restauração de sessão ⭐ MVP

**User Story**: As a sibling, I want to stay signed in after refreshing the page so that I don't have to log in again.

**Acceptance Criteria**:

1. WHEN app carrega com cookie `po_auth` válido THEN client SHALL chamar `GET /auth/me` e popular sessão
2. WHEN cookie ausente ou inválido THEN `isAuthenticated` SHALL ser `false` sem erro visível
3. WHEN restore em progresso THEN guards SHALL exibir loading (evitar flash redirect)

**Independent Test**: Vitest em hook `useSession`; mock 401/200.

### P1: Logout ⭐ MVP

**User Story**: As a sibling, I want to sign out so that my session is not accessible on shared devices.

**Acceptance Criteria**:

1. WHEN usuário aciona "Sair" THEN client SHALL chamar `POST /auth/logout`
2. WHEN logout sucede THEN server SHALL expirar cookie `po_auth`
3. WHEN logout sucede THEN client SHALL limpar session, familyId, antiforgery cache e React Query cache
4. WHEN logout completa THEN system SHALL redirecionar para `/login`

**Independent Test**: Vitest em `logout.usecase`; manual E2E.

### P1: Route guards ⭐ MVP

**User Story**: As a sibling, I want unauthenticated users blocked from app routes so that family data stays private.

**Acceptance Criteria**:

1. WHEN usuário não autenticado acessa `(app)/*` THEN system SHALL redirecionar para `/login`
2. WHEN usuário autenticado acessa `/login` THEN system SHALL redirecionar para destino padrão (dashboard ou smart route)
3. WHEN API retorna 401 em request THEN interceptor SHALL redirecionar para `/login` (já existe — validar com locale)

**Independent Test**: Vitest em helper de redirect; manual navegação.

### P2: API proxy dev

**User Story**: As a developer, I want same-origin API in dev so that cookies work without CORS friction.

**Acceptance Criteria**:

1. WHEN `NEXT_PUBLIC_API_URL` definido THEN `next.config` rewrites `/api/*` para backend
2. WHEN rewrite ativo THEN `HttpClient` baseURL permanece `/api`

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| AUTH-LL-01 | P1 login Google UI + mutation | Pending |
| AUTH-LL-02 | P1 smart routing pós-login | Pending |
| AUTH-LL-03 | P1 cookie set server-side | Pending |
| AUTH-LL-04 | P1 session restore `/auth/me` | Pending |
| AUTH-LL-05 | P1 logout | Pending |
| AUTH-LL-06 | P1 route guards | Pending |
| AUTH-LL-07 | P1 auto familyId quando count=1 | Pending |
| AUTH-LL-08 | P2 dev API rewrite | Pending |
| AUTH-LL-09 | P1 stub destinos pós-login | Pending |

## Out of Scope

| Feature | Reason |
|---------|--------|
| Apple Sign In | Spec auth original |
| Refresh token no JS | Cookie HttpOnly only |
| Playwright E2E | Deferred em STATE.md |
| Middleware server-side auth | Client guards suficientes no MVP |
| Layout shell completo do app | Só stubs + botão Sair |
