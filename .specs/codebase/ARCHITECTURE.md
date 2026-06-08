# Architecture

Alinhado a `ec-v3-ui` com adaptações Ours (Mantine, cookie auth, next-intl).

## Client

```
app/[locale]/                    → rotas finas (App Router)
proxy.ts                         → next-intl edge (substitui middleware.ts)

core/domain/<entity>/
  index.ts                       → Models, Request/Response
  index.contract.ts              → I<Entity>

core/infra/
  http/                          → Axios HttpClient + Factory + Mock
  query/                         → queryClient + queryKeys

core/services/usecases/<entity>/
  *.usecase.ts                   → regras + chamadas HTTP
  index.hooks.ts                 → useQuery / useMutation
  index.mock.ts                  → mocks opcionais

presentation/
  hooks/                         → utilitários (useIsClient)
  modules/<feature>/             → telas (consomem ui/)
  providers/                     → Context: Query, Auth, Family, Mantine
  styles/                        → globals.css, tema

ui/                              → wrappers Mantine por categoria Ant Design
  DataDisplay | DataEntry | Feedback | Layout | Navigation | General
```

## Fluxo

```
Page (app/) → presentation/modules → ui/
                                    → core/services/usecases/index.hooks
                                    → *.usecase → core/infra/http (axios)
                                    → core/domain
```

## Server

Inalterado: `ProjectOurs.API` → Application → Domain → Infrastructure.

## Integração

- Cookie HttpOnly + antiforgery em mutações
- `X-Family-Id` via `FamilyProvider` + `family-context`
- `proxy.ts` para locale routing (next-intl)
