# Project Ours

**Vision:** PWA web para irmãos colaborarem no cuidado dos pais — engajamento mútuo sem rankings nem comparação entre membros.

**For:** Irmãos que dividem rotina de cuidado de parentes idosos.

**Solves:** Informações dispersas, baixo engajamento coordenado e falta de visibilidade das ações de cuidado sem expor contribuições individuais em metas financeiras.

## Goals

- Irmãos registram ligações e veem feed unificado da família ativa em menos de 2 minutos após onboarding.
- Metas financeiras coletivas mostram apenas progresso agregado; nenhum membro vê valor individual de outro.
- Um usuário participa de N famílias com contexto explícito (`X-Family-Id` + seletor no client).

## Tech Stack

**Core:**

- Frontend: Next.js 16.x (App Router), TypeScript, PWA
- Backend: .NET 8+, Clean/Layered Architecture
- Database: PostgreSQL
- Auth: Google OAuth (cookie HttpOnly `po_auth` + antiforgery no client)

**Key dependencies:**

- Client: Mantine, Tailwind, next-intl, TanStack Query, Zustand, Axios, Zod, Vitest
- Server: EF Core, xUnit, Testcontainers (integração)

## Scope

**v1 (MVP) includes:**

- Auth Google + onboarding + smart routing pós-login
- Gestão de família (admin único por família, convites 24h, multi-família)
- Registro de ligações + feed cronológico
- Metas financeiras coletivas com privacidade de contribuições
- Estatísticas pessoais (sem comparação entre irmãos)
- Admin edita dados dos pais

**Explicitly out of scope:**

- Notificações push
- Criptografia end-to-end
- Rankings ou leaderboards
- Pagamentos integrados no MVP

## Constraints

- Interface em português (`pt-BR` default via next-intl)
- Papéis Admin/Member vêm da API, não do JWT decodificado no browser
- Specs em `.specs/` são fonte da verdade; `_docs/` está deprecado
