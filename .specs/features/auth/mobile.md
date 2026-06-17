# Auth — Mobile Specification

**Plataforma:** `mobile/` · **Status:** Pendente (M6)  
**Spec de produto:** [spec.md](spec.md) · **Referência web:** [web.md](web.md)

Replica no mobile os fluxos de auth já implementados no web, adaptando transporte (Bearer + secure store).

---

## Goals

- [ ] Login Google nativo com idToken
- [ ] Smart routing pós-login (onboarding / home / seletor família)
- [ ] Restauração de sessão na abertura do app
- [ ] Logout com limpeza de secure store

---

## User Stories

### M-AUTH-01: Login Google ⭐ MVP

**User Story**: As a sibling on mobile, I want to sign in with Google so that I can access Ours on my phone.

**Acceptance Criteria**:

1. WHEN usuário não autenticado abre o app THEN system SHALL exibir tela de login
2. WHEN usuário toca "Entrar com Google" THEN app SHALL obter idToken via `@react-native-google-signin/google-signin`
3. WHEN idToken é enviado a `POST /api/auth/google` THEN server SHALL retornar session + JWT
4. WHEN login sucede THEN app SHALL persistir JWT em `expo-secure-store`
5. WHEN login sucede THEN app SHALL aplicar smart routing (mesma lógica do web)

**Independent Test**: Mock Google sign-in → usecase → secure store write → route resolver.

---

### M-AUTH-02: Restauração de sessão ⭐ MVP

**User Story**: As a sibling, I want my session restored when I reopen the app.

**Acceptance Criteria**:

1. WHEN app abre com token válido em secure store THEN app SHALL chamar `GET /api/auth/me` com Bearer
2. WHEN restore sucede THEN app SHALL hidratar AuthProvider e FamilyProvider
3. WHEN restore retorna 401 THEN app SHALL limpar secure store e exibir login

**Independent Test**: Secure store com token mock → restore hook → session state.

---

### M-AUTH-03: Smart routing ⭐ MVP

**User Story**: As a sibling, I want to land on the right screen after login.

**Acceptance Criteria**:

1. WHEN `familyCount === 0` THEN navigate to `/(auth)/onboarding` ou equivalente
2. WHEN `familyCount === 1` THEN set family ativa + navigate to `/(app)/`
3. WHEN `familyCount > 1` THEN navigate to seletor de família
4. Reutilizar lógica de `resolvePostLoginRoute` (extrair para shared ou duplicar com testes)

**Independent Test**: Unit test em `resolvePostLoginRoute` com casos 0/1/N.

---

### M-AUTH-04: Logout ⭐ MVP

**User Story**: As a sibling, I want to sign out on a shared device.

**Acceptance Criteria**:

1. WHEN usuário aciona logout THEN app SHALL chamar `POST /api/auth/logout` com Bearer
2. WHEN logout completa THEN secure store SHALL ser limpo
3. WHEN logout completa THEN React Query cache SHALL ser invalidado
4. WHEN logout completa THEN navigate to login

---

## Telas

| Rota Expo | Guard | UI |
|-----------|-------|-----|
| `/(auth)/login` | Guest | Botão Google, fundo cream |
| `/(auth)/onboarding` | Auth | Redirect se já tem família |
| `/(app)/families/select` | Auth | Lista famílias |

Design: [`.specs/design/mobile.md`](../../design/mobile.md) §4.1

---

## Diferenças vs web

| Aspecto | Web | Mobile |
|---------|-----|--------|
| Auth transport | Cookie + antiforgery | Bearer JWT |
| Google SDK | `@react-oauth/google` | `@react-native-google-signin` |
| Storage | Cookie browser | `expo-secure-store` |
| Routing | Next.js middleware/guards | Expo Router layouts |

## Server (possível extensão)

Se cookie-only bloquear mobile: adicionar suporte Bearer no middleware (já planejado em `platforms/server/ARCHITECTURE.md`). Response de login pode incluir `accessToken` no body para mobile.

---

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| M-AUTH-01 | Login Google | Pending |
| M-AUTH-02 | Session restore | Pending |
| M-AUTH-03 | Smart routing | Pending |
| M-AUTH-04 | Logout | Pending |

## Out of Scope (mobile M6)

- Apple Sign In
- Biometria como unlock
- Refresh token rotation
