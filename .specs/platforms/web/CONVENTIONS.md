# Conventions — Web

Pacote: `web/` (PWA admin/suporte) · Plataformas: `.specs/shared/platforms.md`

Referência: ec-v3-ui repository · Skill: `.cursor/skills/ours-client-standard/`

Ver também: [STACK.md](STACK.md) · [ARCHITECTURE.md](ARCHITECTURE.md)

## Stack

Next.js App Router · TypeScript · next-intl (`pt-BR`) · Mantine · Tailwind · TanStack Query · **Axios** · Zod · Vitest

**Estado:** Context API (auth, family) — sem Redux/Zustand para domínio.

## Estrutura `src/`

```
app/                             # App Router — URLs diretas (/, /login, /dashboard)
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

## Design system

Fonte única: [`.specs/design/DESIGN.md`](../../design/DESIGN.md) — tokens compartilhados; **layout web** na §6.

| Camada | Arquivo |
|--------|---------|
| Tokens (spec) | `.specs/design/DESIGN.md` |
| Tokens (runtime) | `presentation/styles/design-tokens.ts` |
| Layout web | `presentation/styles/globals.css` (`web-*`), `ui/Layout/Page`, `ui/Layout/SurfaceCard` |
| Shell admin | `presentation/modules/app-shell/` |
| Auth layout | `presentation/layouts/auth-layout.tsx` |
| Mantine theme | `presentation/styles/mantine-theme.ts` |
| CSS / Tailwind | `presentation/styles/globals.css` |
| Componentes | `ui/*` wrappers — modules nunca declaram hex |

Páginas autenticadas usam `Page` (não `Container size="sm"`). Auth usa `AuthLayout`.

## i18n (MVP monolíngue)

- Locale fixo `pt-BR` em `i18n/request.ts`
- `localePrefix: 'never'` — sem segmento `[locale]` na URL
- Navegação tipada: `@/i18n/navigation` (`Link`, `useRouter`, …)

## Providers

`RootProvider` = Query → Auth → Family → Mantine

## Rotas

URLs diretas sem `[locale]`: `/`, `/login`, `/dashboard`, `/onboarding`, `/families/select`

## Anti-padrões

- Segmento `[locale]` ou `proxy.ts` no MVP (só reintroduzir com multi-idioma)
- Importar `@mantine/core` direto em modules (usar `ui/`)
- Hex ou cores arbitrárias em modules (usar tema / CSS vars)
- Zustand/Redux para sessão (usar Context em `presentation/providers`)
- axios/fetch em `page.tsx`
