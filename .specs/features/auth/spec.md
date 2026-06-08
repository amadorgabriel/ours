# Auth — Specification

## Problem Statement

Irmãos precisam entrar com Google de forma segura e ser roteados para onboarding, seleção de família ou dashboard conforme estado da conta.

## Goals

- [ ] Login Google com cookie HttpOnly e antiforgery em mutações
- [ ] Smart routing pós-login baseado em `familyCount` e onboarding

## User Stories

### P1: Autenticação e roteamento ⭐ MVP

**User Story**: As a sibling, I want to sign in with Google and land on the right screen so that I can start or continue using Ours.

**Acceptance Criteria**:

1. WHEN usuário não autenticado acessa app THEN system SHALL exibir login Google
2. WHEN login sucede e `familyCount === 0` THEN system SHALL redirecionar para onboarding
3. WHEN login sucede e `familyCount === 1` THEN system SHALL redirecionar para dashboard com família ativa definida
4. WHEN login sucede e `familyCount > 1` THEN system SHALL redirecionar para seleção de família
5. WHEN API retorna 401 THEN client SHALL redirecionar para `/login`
6. WHEN mutação POST/PUT/DELETE THEN client SHALL enviar `RequestVerificationToken`

**Independent Test**: Vitest em `resolvePostLoginRoute` + gateway parse; fluxo manual E2E pendente.

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| AUTH-01 | P1 login UI | Verified |
| AUTH-02 | P1 smart routing | Verified |
| AUTH-03 | P1 cookie + antiforgery HTTP | Pending |
| AUTH-04 | P1 E2E manual | Pending |

## Out of Scope

- Apple Sign In
- Refresh token exposto ao JS
