# Auth — Specification

## Problem Statement

Irmãos precisam entrar com Google de forma segura, permanecer autenticados entre reloads, sair quando quiserem, e ser roteados para onboarding, seleção de família ou dashboard conforme estado da conta.

## Goals

- [ ] Login Google com cookie HttpOnly e antiforgery em mutações
- [ ] Smart routing pós-login baseado em `familyCount` e onboarding
- [ ] Restauração de sessão via `GET /auth/me`
- [ ] Logout com invalidação de cookie e limpeza de estado client
- [ ] Route guards em `(app)` e `(auth)`

## User Stories

### P1: Autenticação e roteamento ⭐ MVP

**User Story**: As a sibling, I want to sign in with Google and land on the right screen so that I can start or continue using Ours.

**Acceptance Criteria**:

1. WHEN usuário não autenticado acessa `(app)/*` THEN system SHALL redirecionar para `/login`
2. WHEN usuário acessa `/login` THEN system SHALL exibir login Google
3. WHEN login sucede e `familyCount === 0` THEN system SHALL redirecionar para onboarding
4. WHEN login sucede e `familyCount === 1` THEN system SHALL redirecionar para dashboard com família ativa definida
5. WHEN login sucede e `familyCount > 1` THEN system SHALL redirecionar para seleção de família
6. WHEN API retorna 401 THEN client SHALL redirecionar para `/login`
7. WHEN mutação POST/PUT/DELETE THEN client SHALL enviar `RequestVerificationToken`

**Independent Test**: Vitest em `resolvePostLoginRoute` + gateway parse; fluxo manual E2E pendente.

### P1: Persistência de sessão ⭐ MVP

**User Story**: As a sibling, I want my session to survive page reloads so that I don't need to sign in repeatedly.

**Acceptance Criteria**:

1. WHEN app carrega com cookie válido THEN client SHALL restaurar sessão via `GET /auth/me`
2. WHEN restore falha (401) THEN client SHALL tratar como não autenticado

### P1: Logout ⭐ MVP

**User Story**: As a sibling, I want to sign out so that my account is not accessible on shared devices.

**Acceptance Criteria**:

1. WHEN usuário aciona logout THEN client SHALL chamar `POST /auth/logout`
2. WHEN logout sucede THEN cookie SHALL ser removido e client SHALL limpar caches locais
3. WHEN logout completa THEN system SHALL redirecionar para `/login`

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| AUTH-01 | P1 login UI | Pending → change 003 |
| AUTH-02 | P1 smart routing | Verified (fn) / Pending (wired) |
| AUTH-03 | P1 cookie + antiforgery HTTP | Partial (client ok, server pending) |
| AUTH-04 | P1 session restore | Pending |
| AUTH-05 | P1 logout | Pending |
| AUTH-06 | P1 route guards | Pending |
| AUTH-07 | P1 E2E manual | Pending |

## Active Change

Implementação detalhada: `.specs/changes/003-login-logout-flow/`

## Out of Scope

- Apple Sign In
- Refresh token exposto ao JS
- Playwright E2E (deferred)
