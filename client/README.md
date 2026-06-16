# Project Ours — frontend (`client/`)

Next.js (App Router) + TypeScript, **next-intl** (`pt-BR`), Mantine, Tailwind, TanStack Query, Axios, Zod, date-fns. Arquitetura em camadas conforme [`.specs/codebase/CONVENTIONS.md`](../.specs/codebase/CONVENTIONS.md).

## Requisitos

- Node.js LTS
- npm

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha. Nunca commite segredos.

## Comandos

| Comando              | Descrição                                   |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                 |
| `npm run build`      | Build de produção                           |
| `npm run start`      | Servidor após build                         |
| `npm run lint`       | ESLint                                      |
| `npm run lint:fix`   | ESLint com correção automática              |
| `npm run type-check` | `tsc --noEmit`                              |
| `npm run test`       | Vitest (watch)                              |
| `npm run test:run`   | Vitest uma vez (CI / pre-push)              |
| `npm run test:ui`    | Vitest UI no browser (playground de testes) |

## Husky (monorepo)

O repositório Git está na pasta pai. Após `npm install` em `client/`, o script `prepare` configura `core.hooksPath` para `client/.husky`. Os hooks executam os scripts acima a partir de `client/`.

## Estrutura

- `src/app/` — rotas App Router (`/`, `/login`, `/dashboard`, …)
- `src/core/` — domain, infra (http/query), services/usecases
- `src/presentation/` — modules, providers (Context), styles
- `src/ui/` — wrappers Mantine por categoria
- `src/i18n/` — request config, mensagens `pt-BR.json`, navigation helpers

## Documentação

- `.specs/codebase/CONVENTIONS.md`
- Skill: `.cursor/skills/ours-client-standard/`
