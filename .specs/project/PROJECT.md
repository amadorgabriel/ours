# Project Ours

**Vision:** Hub de cuidado parental colaborativo — app para irmãos e cuidadores visualizarem, de forma fácil, o cuidado com um parente: ligações, envio de dinheiro, notas e informações compartilhadas.

**For:** Irmãos e familiares que dividem a rotina de cuidado de pais ou assistidos.

**Solves:** Informações dispersas, baixo engajamento coordenado e falta de visibilidade das ações de cuidado — **sem rankings nem comparação entre membros**.

## Três frentes

| Frente | Path | Papel |
|--------|------|-------|
| **Mobile** | `mobile/` | Cliente principal (uso diário) |
| **Web** | `web/` | PWA admin/suporte + fase ponte do MVP |
| **Server** | `server/` | API REST única (.NET 8 + PostgreSQL) |

Documentação por plataforma: `.specs/platforms/{mobile,web,server}/`

## Goals

- Cuidadores registram ligações ("Liguei agora") e veem feed unificado em menos de 2 minutos após onboarding
- Calendário mensal de atividades por assistido ou agregado
- Metas financeiras coletivas com progresso agregado apenas
- Um usuário participa de N famílias com contexto explícito (`X-Family-Id` + seletor)
- Seletor de assistido (Pai, Mãe) no contexto da família ativa

## Tech Stack

| Frente | Stack |
|--------|-------|
| Mobile | Expo SDK 52+, React Native, TypeScript, NativeWind, TanStack Query |
| Web | Next.js 16, Mantine, Tailwind, TanStack Query, Axios |
| Server | .NET 8, EF Core, PostgreSQL, xUnit |

Detalhes: `.specs/platforms/*/STACK.md` · Matriz: `.specs/shared/platforms.md`

## Scope

**v1 (MVP) includes:**

- Auth Google + onboarding + smart routing
- Gestão de família (admin único, convites 24h, multi-família)
- Seletor de assistido
- Registro de ligações + feed cronológico + calendário mensal
- Metas financeiras coletivas com privacidade de contribuições
- Notas gerais sobre assistido
- Estatísticas pessoais (sem comparação entre irmãos)
- Admin edita dados dos pais, credenciais e anexos (web)

**Fase ponte:** até `mobile/` M6, `web/` implementa o MVP completo.

**Explicitly out of scope:**

- Heart rate, sono, humor do assistido
- Agendamento de eventos
- Notificações push, E2E encryption, rankings, pagamentos integrados

Ver `.specs/memory/constitution.md` para princípios completos.

## Constraints

- Interface em português (`pt-BR`)
- Papéis Admin/Member vêm da API
- Specs em `.specs/` são fonte da verdade
- Server e DB compartilhados entre `web/` e `mobile/`
