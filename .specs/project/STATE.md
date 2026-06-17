# State — Project Ours

Memória persistente entre sessões. Atualizar ao registrar decisões, bloqueios ou lições.

> **Constituição** (princípios fixos): `.specs/memory/constitution.md`  
> **Concerns** (riscos técnicos): `.specs/shared/CONCERNS.md`

## Decisões

| Data | Decisão | Motivo |
|------|---------|--------|
| 2026-06-17 | **Estrutura `.specs/` com 3 frentes:** `platforms/{mobile,web,server}/` | Suportar mobile, web e server com docs dedicados |
| 2026-06-17 | **Stack mobile:** Expo SDK 52+ + RN + TS + NativeWind + TanStack Query | Paridade com web, ecossistema maduro, Google Sign-In |
| 2026-06-17 | **Auth mobile:** Bearer JWT + expo-secure-store (não cookie) | Cookies não funcionam em app nativo |
| 2026-06-17 | **Design mobile:** `.specs/design/mobile.md` v1.0 (Wave Tab Bar, sheets) | Tokens compartilhados + layouts mobile-first |
| 2026-06-17 | **Features auth/family:** specs mobile em `features/*/mobile.md` | Preparar replicação no M6 |
| 2026-06-17 | **Constituição** reescrita com kickoff (histórias US-01–09, fora de escopo) | Alinhar produto ao hub de cuidado parental |
| 2026-06-17 | **`memory/` mantido** separado de `STATE.md` | Constitution = princípios imutáveis; STATE = decisões evolutivas |
| 2026-06-17 | **`codebase/` removido** — conteúdo em `platforms/` e `shared/CONCERNS.md` | Eliminar docs deprecados |
| 2026-06-17 | **`codebase/` → `platforms/`** | Brownfield por frente, não monolítico |
| 2026-06-16 | `client/` → `web/`; `mobile/` placeholder | Cliente principal será mobile |
| 2026-06-16 | Fase ponte: web mantém MVP até mobile M6 | Evita produto sem interface |
| 2026-06-16 | Rotas web sem `[locale]` | MVP monolíngue pt-BR |
| 2026-06-08 | M0 + M1 concluídos | Fundação + auth |
| 2026-05 | Multi-família via `FamilyMembership` + `X-Family-Id` | PRD v1.1 |
| 2026-05 | Cookie HttpOnly `po_auth` no web | Segurança + CSRF |

## Bloqueios

| Item | Detalhe |
|------|---------|
| ec-v3-ui | Referência em `c:\_git\job\ec\ec-v3-ui` |
| Mobile M6 | Scaffold Expo pendente; specs prontas |
| Server Bearer auth | Middleware pode precisar extensão para mobile |

## Lições

- Specs por plataforma (`web.md` + `mobile.md`) evitam misturar implementação com requisito de produto
- `shared/` deve conter apenas domínio/API transversal — stack vai em `platforms/`
- Definir stack mobile antes do scaffold reduz retrabalho de auth

## Deferred

- Playwright E2E (após M2 estável)
- PWA offline avançado
- OpenAPI em `shared/contracts/`
- Cadastro Parent no onboarding (M5)
- Poda consumer features do `web/` (pós-mobile M6)
- `packages/shared/` no monorepo (tipos Zod compartilhados)
- Convite WhatsApp / link compartilhável

## Todos (sessão)

- [x] Reestruturar `.specs/` para 3 frentes
- [x] Definir stack + arquitetura mobile
- [x] Documentar arquitetura server
- [x] Criar design mobile + specs auth/family mobile
- [x] Atualizar constitution, PROJECT, ROADMAP
- [ ] Concluir M2 family no web
- [ ] Scaffold mobile M6

## Preferences

- Responder em português
- Fluxo TLC: ler `.specs` → implementar → testes
