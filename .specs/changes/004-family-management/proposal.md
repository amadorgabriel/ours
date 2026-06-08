# Change 004 — Family Management + Invites

## Why

M0 (fundação) e M1 (auth + smart routing) estão concluídos. O app ainda redireciona usuários sem família para stubs vazios (`/onboarding`, `/families/select`) e não há endpoints `POST /families`, `GET /families/my`, `POST /invite`, `POST /join` — embora entidades EF (`Family`, `FamilyMembership`, `FamilyInvite`) já existam no server.

Implementar gestão de família desbloqueia M2 e prepara M3+ (atividades, metas) que dependem de `X-Family-Id`.

## What

1. **Server:** `FamilyService` + repositório; controllers para criar/listar famílias, gerar convite (Admin, 24h, código 6 chars) e join por código
2. **Client:** estender domain/use cases/hooks de `family`; substituir stubs de onboarding e seleção; UI mínima de convite para Admin
3. **Integração:** após create/join, invalidar sessão auth e aplicar família ativa; header `X-Family-Id` já wired via `FamilyProvider`

## Impact

| Área | Detalhe |
|------|---------|
| **Client** | `presentation/modules/family/*`, stubs → módulos reais; i18n `family` |
| **Server** | Novos controllers Application + Infrastructure; testes unitários de regras |
| **Risk** | Baixo — schema já modelado; auth cookie pronto |
| **Breaking** | Nenhum; stubs viram implementação |

## Success

- [ ] Onboarding: criar família OU entrar com código → dashboard
- [ ] Multi-família: seletor funcional em `/families/select`
- [ ] Admin gera convite copiável com validade 24h
- [ ] Bruno/collection atualizada com novos endpoints
- [ ] Gates: `npm run pre-push:checks` + `dotnet test`

## References

- Feature spec: `.specs/features/family/spec.md`
- Context: `.specs/changes/004-family-management/context.md`
- Design: `.specs/changes/004-family-management/design.md`
- Tasks: `.specs/changes/004-family-management/tasks.md`
