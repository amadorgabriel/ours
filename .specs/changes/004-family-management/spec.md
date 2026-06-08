# Change 004 — Family Management (implementation spec)

**Feature:** `.specs/features/family/spec.md`  
**Context:** `.specs/changes/004-family-management/context.md`

Este documento espelha a feature spec com IDs rastreáveis para tasks. Critérios WHEN/THEN idênticos à feature spec.

## Escopo do change

| In | Out |
|----|-----|
| POST/GET families, POST invite/join | Parent CRUD |
| Onboarding create + join | Remover membro |
| Family select page | E-mail de convite |
| Admin invite UI no dashboard | Playwright E2E |

## Requirements (implementação)

| ID | Critério resumido |
|----|-------------------|
| FAM-01 | POST `/api/families` cria Family + Membership Admin |
| FAM-02 | POST `/api/join` aceita código válido → Member |
| FAM-03 | `/families/select` lista e define família ativa |
| FAM-04 | POST `/api/invite` gera código 6 chars, 24h |
| FAM-05 | Validação nome 1–100 chars |
| FAM-06 | Client refresh sessão após create/join |
| FAM-07 | Invite retorna 403 se não Admin |
| FAM-08 | Join rejeita expirado/inválido/já membro |

## API payloads (referência)

```typescript
// POST /api/families
{ name: string }
→ { id: string; name: string }

// GET /api/families/my
→ { id: string; name: string; role: 'Admin' | 'Member' }[]

// POST /api/invite  (+ X-Family-Id)
{ invitedEmail?: string }
→ { inviteCode: string; expiresAt: string }

// POST /api/join
{ inviteCode: string }
→ { familyId: string; familyName: string; role: 'Member' }
```

## Status

| ID | Status |
|----|--------|
| FAM-01 … FAM-08 | Pending |
