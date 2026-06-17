# Family — Mobile Specification

**Plataforma:** `mobile/` · **Status:** Pendente (M6, após auth mobile)  
**Spec de produto:** [spec.md](spec.md) · **Referência web:** [web.md](web.md)

Replica no mobile os fluxos de família do web, com UX mobile-first (sheets, não modais).

---

## Goals

- [ ] Criar família no onboarding
- [ ] Entrar com código de convite
- [ ] Selecionar família ativa (multi-família)
- [ ] Admin gera e compia código de convite
- [ ] Selecionar assistido ativo (Parent)

---

## User Stories

### M-FAM-01: Criar família ⭐ MVP

**User Story**: As a sibling with no family, I want to create a family on mobile.

**Acceptance Criteria**:

1. WHEN usuário com `familyCount === 0` THEN exibir onboarding com criar OU entrar
2. WHEN submete nome válido THEN `POST /api/families` + membership Admin
3. WHEN sucesso THEN refresh session, set family ativa, navigate to `/(app)/`
4. UI: bottom sheet ou tela full com input nome + CTA

**Independent Test**: Integration mock POST families → session update → navigation.

---

### M-FAM-02: Entrar com código ⭐ MVP

**User Story**: As an invited sibling, I want to join with a 6-char code.

**Acceptance Criteria**:

1. WHEN submete código 6 chars THEN `POST /api/join`
2. WHEN válido THEN Member + convite Accepted
3. WHEN já membro THEN erro 409 com mensagem clara
4. Input: teclado alfanumérico uppercase, máscara 6 chars

**Independent Test**: Join usecase + error mapping.

---

### M-FAM-03: Seletor de família ⭐ MVP

**User Story**: As a sibling in N families, I want to switch active family.

**Acceptance Criteria**:

1. WHEN `familyCount > 1` THEN tela/lista de famílias com nome e papel
2. WHEN seleciona THEN `setFamilyId` + todas requests com `X-Family-Id`
3. Acesso via chip no header (`.specs/design/mobile.md` §3)

---

### M-FAM-04: Admin gera convite ⭐ MVP

**User Story**: As admin, I want to share an invite code.

**Acceptance Criteria**:

1. WHEN Admin chama `POST /api/invite` THEN código 6 chars, 24h
2. UI: exibir código grande, botão copiar, botão compartilhar (Share API nativa)
3. WHEN não admin THEN 403

---

### M-FAM-05: Seletor de assistido ⭐ MVP

**User Story**: As a caregiver, I want to select which parent I'm caring for (Pai, Mãe).

**Acceptance Criteria**:

1. WHEN família tem Parents cadastrados THEN header mostra assistido ativo
2. WHEN tap no chip THEN bottom sheet com lista de Parents
3. WHEN seleciona THEN `AssistidoProvider` atualiza contexto
4. Ações de cuidado (ligações, notas) usam assistido ativo como default

> **Nota:** Cadastro de Parents é M5; no M6 o seletor pode estar vazio até M5 server.

**Independent Test**: AssistidoProvider state + default em call registration.

---

## Telas

| Rota | Descrição |
|------|-----------|
| `/(auth)/onboarding` | Criar família / entrar código |
| `/(app)/families/select` | Multi-família |
| Sheet: convite | Admin gera código |
| Sheet: assistido | Seleção Pai/Mãe |

Design: [`.specs/design/mobile.md`](../../design/mobile.md) §4.2, §4.6

---

## Diferenças vs web

| Aspecto | Web | Mobile |
|---------|-----|--------|
| Convite | Modal / card | Bottom sheet + Share API |
| Onboarding | Split layout admin | Vertical stack mobile |
| Assistido | — (M5) | Seletor no header (M6 prep) |

---

## Requirement Traceability

| ID | Story | Depends | Status |
|----|-------|---------|--------|
| M-FAM-01 | Criar família | M-AUTH-03 | Pending |
| M-FAM-02 | Join código | M-AUTH-03 | Pending |
| M-FAM-03 | Seletor família | M-AUTH-03 | Pending |
| M-FAM-04 | Admin convite | M-FAM-01 | Pending |
| M-FAM-05 | Seletor assistido | M-FAM-01 | Pending |

## Out of Scope (mobile M6)

- Editar dados dos pais (M5)
- Remover membro / transferir admin
- Convite por e-mail
