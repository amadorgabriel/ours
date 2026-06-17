# Plataformas — Project Ours

**Última atualização:** 2026-06-17

## Visão

| Pacote | Papel | Status | Stack | Docs |
|--------|-------|--------|-------|------|
| `mobile/` | Cliente **principal** — uso diário | Placeholder → M6 | Expo + RN + TS | [`.specs/platforms/mobile/`](../platforms/mobile/) |
| `web/` | PWA **admin/suporte** + fase ponte | Ativo | Next.js 16, Mantine | [`.specs/platforms/web/`](../platforms/web/) |
| `server/` | API REST única | Ativo | .NET 8, PostgreSQL | [`.specs/platforms/server/`](../platforms/server/) |

## Matriz de features (estado alvo)

| Feature / domínio | `mobile/` | `web/` | `server/` |
|-------------------|-----------|--------|-----------|
| Auth Google | ✅ primário | ✅ admin login | `/auth/*` |
| Onboarding / join | ✅ | ✅ (ponte) | `/families`, `/join` |
| Seletor assistido | ✅ | ❌ | `Parent` entity |
| Feed + atividades | ✅ | ❌ (pós-M0) | `/activities` |
| Calendário mensal | ✅ | ❌ | `/activities` |
| Metas financeiras | ✅ | ❌ (pós-M0) | `/goals` |
| Estatísticas pessoais | ✅ | ❌ | `/stats` |
| Gestão família + convites | ✅ básico | ✅ completo | `/families`, `/invite` |
| Dados dos pais (Admin) | leitura | ✅ edição | `/parents` |
| Credenciais / anexos | ✅ (M5+) | ✅ admin | `/parents` |
| Seletor multi-família | ✅ | ✅ | `X-Family-Id` |

**Legenda:** ✅ = responsabilidade primária · ❌ = fora de escopo na plataforma

## Fase ponte (agora → mobile M6)

- `web/` implementa **todas** as features do roadmap MVP
- Specs mobile em `.specs/features/*/mobile.md` preparam replicação
- Nenhuma feature removida do web até mobile M0

## Compartilhado entre plataformas

| Recurso | Path |
|---------|------|
| Tokens visuais | `.specs/design/DESIGN.md` |
| Design mobile | `.specs/design/mobile.md` |
| Domínio | `.specs/shared/domain-model.md` |
| API | `.specs/shared/api-contracts.md` |
| Glossário | `.specs/shared/glossary.md` |
| Constituição | `.specs/memory/constitution.md` |

## Auth por plataforma

| Plataforma | Mecanismo |
|------------|-----------|
| Web | Cookie HttpOnly `po_auth` + antiforgery |
| Mobile | Bearer JWT + `expo-secure-store` |
| Server | Aceita cookie ou Bearer |

## Gates

| Pacote | Comando |
|--------|---------|
| `web/` | `cd web && npm run pre-push:checks` |
| `mobile/` | `cd mobile && npm run test` (quando existir) |
| `server/` | `cd server && dotnet test` |
