# Family — Web Implementation

**Plataforma:** `web/` · **Status:** Em progresso (M2)  
**Spec de produto:** [spec.md](spec.md)

## Implementação

| Requisito | Status | Localização |
|-----------|--------|-------------|
| FAM-01 Criar família | Pending | change 004 |
| FAM-02 Join convite | Pending | change 004 |
| FAM-03 Seletor família | Pending | change 004 |
| FAM-04 Admin convite | Pending | change 004 |
| FAM-05 Validação nome | Pending | change 004 |
| FAM-06 Refresh sessão | Pending | change 004 |
| FAM-07 Admin-only invite | Pending | change 004 |
| FAM-08 Código 6 chars + 24h | Pending | server ✅ |

## Server (parcial)

Endpoints implementados em `FamiliesController`, `InvitesController`.

## Change ativo

`.specs/archive/004-family-management/` (tasks T1–T20)

## Gate

```bash
cd web && npm run pre-push:checks && cd ../server && dotnet test
```
