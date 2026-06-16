# Modelo de domínio (resumo)

Diagrama completo e campos: feature specs em `.specs/features/` e entidades em `server/`.

## Entidades principais

```text
User ←N:N→ FamilyMembership ←N:N→ Family
Family → Parent, FamilyInvite, Activity, Goal
Goal → GoalContribution
```

## Regras estruturais

- `(userId, familyId)` único em `FamilyMembership`
- Um admin por família (`Family.adminId`)
- `Activity`, `Goal`, `Parent` sempre com `familyId`
- `GoalContribution.amount` visível só para o próprio contribuinte na API de detalhe pessoal

## Enums

| Enum | Valores |
|------|---------|
| UserRole | Admin, Member |
| InviteStatus | Pending, Accepted, Rejected, Expired |
| ActivityType | Call, Visit, Medical, Task, Medication |
| GoalStatus | Active, Completed, Cancelled |
