# Family — Specification

## Problem Statement

Após login, irmãos sem família não conseguem usar o app; quem já participa de uma ou mais famílias precisa criar grupo, entrar por convite ou escolher a família ativa. Sem gestão de família e convites, o smart routing pós-auth fica preso em stubs.

## Goals

- [ ] Usuário sem família cria uma família e vira Admin em menos de 2 minutos
- [ ] Admin gera convite com código de 6 caracteres válido por 24 horas
- [ ] Irmão entra na família com código e passa a ser Member
- [ ] Usuário com N famílias seleciona família ativa; `X-Family-Id` enviado nas próximas requisições

## Out of Scope

| Feature | Reason |
|---------|--------|
| Edição de dados dos pais | Milestone M5 |
| Remover membro / sair da família | Pós-MVP |
| Transferência de admin | Pós-MVP |
| Convite por e-mail (envio) | MVP: código copiável; `InvitedEmail` opcional no DB |
| Rejeitar convite | Apenas aceitar ou expirar |

---

## User Stories

### P1: Criar família (onboarding) ⭐ MVP

**User Story**: As a sibling with no family, I want to create a family so that I can start coordinating care with my siblings.

**Why P1**: Desbloqueia `familyCount === 0` → dashboard; criador vira Admin único da família.

**Acceptance Criteria**:

1. WHEN usuário autenticado com `familyCount === 0` acessa onboarding THEN system SHALL exibir fluxo de criar família ou entrar com código
2. WHEN usuário submete nome válido (1–100 chars) THEN system SHALL chamar `POST /api/families` e criar `Family` + `FamilyMembership` com role Admin
3. WHEN criação sucede THEN client SHALL atualizar sessão (`GET /auth/me`), definir família ativa e redirecionar para `/dashboard`
4. WHEN nome inválido ou vazio THEN system SHALL retornar erro de validação sem criar família

**Independent Test**: POST `/api/families` + membership Admin; onboarding manual com usuário novo.

---

### P1: Entrar com código de convite ⭐ MVP

**User Story**: As a sibling invited by the admin, I want to join a family with an invite code so that I can participate in the same group.

**Why P1**: Segundo caminho do onboarding; completa o fluxo multi-usuário.

**Acceptance Criteria**:

1. WHEN usuário submete código de 6 caracteres THEN system SHALL chamar `POST /api/join`
2. WHEN código válido, pendente e não expirado THEN system SHALL criar `FamilyMembership` com role Member e marcar convite como Accepted
3. WHEN usuário já é membro da família THEN system SHALL retornar erro claro (409)
4. WHEN código inválido, expirado ou já usado THEN system SHALL retornar erro 400/404
5. WHEN join sucede THEN client SHALL atualizar sessão, definir família ativa e redirecionar para `/dashboard`

**Independent Test**: Admin cria convite → segundo usuário faz join → ambos veem família em `/auth/me`.

---

### P1: Selecionar família ativa ⭐ MVP

**User Story**: As a sibling in multiple families, I want to pick which family is active so that my actions target the right group.

**Why P1**: Requisito multi-família do PROJECT.md; substitui stub `/families/select`.

**Acceptance Criteria**:

1. WHEN usuário com `familyCount > 1` acessa `/families/select` THEN system SHALL listar famílias do usuário com nome e papel
2. WHEN usuário seleciona uma família THEN client SHALL chamar `setFamilyId` e redirecionar para `/dashboard`
3. WHEN família ativa está definida THEN mutações com escopo familiar SHALL incluir header `X-Family-Id`

**Independent Test**: Usuário em 2 famílias alterna seleção; request mock verifica header.

---

### P2: Admin gera convite ⭐ MVP (dentro de M2)

**User Story**: As a family admin, I want to generate an invite code so that my siblings can join the family.

**Why P2**: Essencial para onboarding do segundo irmão; depende de família existente.

**Acceptance Criteria**:

1. WHEN Admin autenticado chama `POST /api/invite` com `X-Family-Id` válido THEN system SHALL gerar código único de 6 caracteres alfanuméricos
2. WHEN convite é criado THEN `ExpiresAt` SHALL ser `CreatedAt + 24 horas` e status Pending
3. WHEN usuário não é Admin da família ativa THEN system SHALL retornar 403
4. WHEN convite é criado THEN client SHALL exibir código, validade e ação copiar

**Independent Test**: Admin gera código; Bruno ou integration test valida expiração e unicidade.

---

## Edge Cases

- WHEN convite expira THEN join SHALL falhar com mensagem de código expirado
- WHEN Admin tenta convidar sem `X-Family-Id` THEN system SHALL retornar 400
- WHEN usuário cria família com nome duplicado (outro grupo) THEN system SHALL permitir (nomes não são únicos globalmente)
- WHEN join após logout/login THEN sessão SHALL refletir novas memberships via `/auth/me`

---

## Requirement Traceability

| ID | Story | Phase | Status |
|----|-------|-------|--------|
| FAM-01 | P1 criar família | Change 004 | Pending |
| FAM-02 | P1 join convite | Change 004 | Pending |
| FAM-03 | P1 selecionar família | Change 004 | Pending |
| FAM-04 | P2 admin gera convite | Change 004 | Pending |
| FAM-05 | P1 validação nome família | Change 004 | Pending |
| FAM-06 | P1 refresh sessão pós-mutação | Change 004 | Pending |
| FAM-07 | P2 admin-only invite | Change 004 | Pending |
| FAM-08 | P1 código 6 chars + 24h | Change 004 | Pending |

**Coverage:** 8 total, 8 mapped to tasks T4–T20 ✅

---

## Success Criteria

- [ ] Usuário novo cria família e chega ao dashboard em fluxo manual
- [ ] Segundo usuário entra com código e aparece como Member na sessão
- [ ] Usuário multi-família alterna contexto ativo
- [ ] `npm run pre-push:checks` e `dotnet test` passam

## Active Change

Implementação: `.specs/changes/004-family-management/`
