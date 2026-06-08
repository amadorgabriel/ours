# Conventions — Client (ec-v3-ui aligned)

Referência: `c:\_git\job\ec\ec-v3-ui` · Skill: `.cursor/skills/ours-client-standard/`

## Stack

Next.js App Router · TypeScript · next-intl (`pt-BR`) · Mantine · Tailwind · TanStack Query · **Axios** · Zod · Vitest

**Estado:** Context API (auth, family) — sem Redux/Zustand para domínio.

## Estrutura `src/`

```
app/[locale]/                    # App Router (rotas finas)
proxy.ts                         # next-intl (não middleware.ts)
core/
  domain/<entity>/
    index.ts                     # Models, Request/Response types
    index.contract.ts            # Interface I<Entity>
  infra/
    http/                        # Axios client, factory, mock
    query/                       # query-client.ts, query-keys.ts
  services/usecases/<entity>/
    *.usecase.ts
    index.hooks.ts               # React Query hooks
    index.mock.ts                # mocks quando necessário
presentation/
  hooks/                         # hooks utilitários (useIsClient, etc.)
  modules/<feature>/             # UI por feature (index.tsx)
  providers/                     # Context: query, auth, family, mantine
  styles/                        # globals.css, tema Mantine
ui/                              # Design system (segregação Ant Design)
  DataDisplay/
  DataEntry/
  Feedback/
  Layout/
  Navigation/
  General/
i18n/
test/setup.ts
```

## Fluxo de dados

```
app/ → presentation/modules → ui/
                           → core/services/usecases/index.hooks.ts
                           → core/services/usecases/*.usecase.ts
                           → core/infra/http (axios)
                           → core/domain
```

## HTTP (Axios)

- `HttpClientFactory.create()` — singleton
- `withCredentials: true`, base `/api`
- Mutações: `RequestVerificationToken` (cache em `antiforgery-store`)
- Família ativa: `X-Family-Id` via `family-context` + `FamilyProvider`
- 401 → `/login`

## Testes

Colocados ao lado do código: `*.test.ts`, `*.test.tsx`

Gate: `npm run pre-push:checks`

## Anti-padrões

- `middleware.ts` para i18n (usar `proxy.ts`)
- Importar `@mantine/core` direto em modules (usar `ui/`)
- Zustand/Redux para sessão (usar Context em `presentation/providers`)
- axios/fetch em `page.tsx`
