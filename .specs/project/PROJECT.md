# Project Ours

**Vision:** App mobile para irmãos colaborarem no cuidado dos pais — engajamento mútuo sem rankings nem comparação entre membros. PWA web (`web/`) como interface **admin/suporte opcional** para gestão de família e dados dos pais.

**For:** Irmãos que dividem rotina de cuidado de parentes idosos.

**Solves:** Informações dispersas, baixo engajamento coordenado e falta de visibilidade das ações de cuidado sem expor contribuições individuais em metas financeiras.

## Goals

- Irmãos registram ligações e veem feed unificado da família ativa em menos de 2 minutos após onboarding (mobile — futuro; web na fase ponte).
- Metas financeiras coletivas mostram apenas progresso agregado; nenhum membro vê valor individual de outro.
- Um usuário participa de N famílias com contexto explícito (`X-Family-Id` + seletor no client ativo).

## Tech Stack

**Core:**

- Mobile (principal): **TBD** — placeholder em `mobile/` (change futuro)
- Web (admin PWA): Next.js 16.x (App Router), TypeScript, PWA
- Backend: .NET 8+, Clean/Layered Architecture
- Database: PostgreSQL
- Auth: Google OAuth (cookie HttpOnly `po_auth` + antiforgery no web)

**Key dependencies:**

- Web: Mantine, Tailwind, next-intl, TanStack Query, Zustand, Axios, Zod, Vitest
- Server: EF Core, xUnit, Testcontainers (integração)

Ver matriz de plataformas: `.specs/shared/platforms.md`

## Scope

**v1 (MVP) includes:**

- Auth Google + onboarding + smart routing pós-login
- Gestão de família (admin único por família, convites 24h, multi-família)
- Registro de ligações + feed cronológico
- Metas financeiras coletivas com privacidade de contribuições
- Estatísticas pessoais (sem comparação entre irmãos)
- Admin edita dados dos pais

**Fase ponte:** até `mobile/` existir, `web/` implementa o MVP completo. Ver `changes/006-client-platform-split/context.md`.

**Explicitly out of scope:**

- Notificações push
- Criptografia end-to-end
- Rankings ou leaderboards
- Pagamentos integrados no MVP
- App mobile (neste momento — apenas placeholder)

## Constraints

- Interface em português (`pt-BR` default via next-intl no web)
- Papéis Admin/Member vêm da API, não do JWT decodificado no browser
- Specs em `.specs/` são fonte da verdade; `_docs/` está deprecado
- Server e DB compartilhados entre `web/` e futuro `mobile/`
