# Modelo de domínio (resumo)

Diagrama completo e campos: feature specs em `.specs/features/` e entidades em `server/src/ProjectOurs.Domain/`.

## Entidades principais

```text
User ←N:N→ FamilyMembership ←N:N→ Family
Family → Parent, FamilyInvite, Activity, Goal
Goal → GoalContribution
Parent → Credential (M5+), Attachment (M5+)
```

## Regras estruturais

- `(userId, familyId)` único em `FamilyMembership`
- Um admin por família (`Family.adminId`)
- `Activity`, `Goal`, `Parent` sempre com `familyId`
- `Activity` referencia `parentId` quando tipo de cuidado é por assistido
- `GoalContribution.amount` visível só para o próprio contribuinte na API de detalhe pessoal

## Enums

| Enum | Valores |
|------|---------|
| UserRole | Admin, Member |
| InviteStatus | Pending, Accepted, Rejected, Expired |
| ActivityType | Call, Visit, Medical, Task, Medication, Note |
| GoalStatus | Active, Completed, Cancelled |
| ParentRelation | Father, Mother, Other |

## Termos de produto

Ver [glossary.md](glossary.md) — **Assistido** = `Parent` no código.

## Plataformas

Auth e escopo familiar: [platforms.md](platforms.md)
