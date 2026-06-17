# Architecture — Web

Alinhado a `ec-v3-ui` com adaptações Ours (Mantine, cookie auth, next-intl).

**Pacote:** `web/` · **Plataformas:** [`.specs/shared/platforms.md`](../../shared/platforms.md)

## Camadas

```
app/                             → rotas finas (App Router, URLs diretas)
  page.tsx                       → / (smart redirect via HomePage)
  (auth)/login                   → guest guard
  (app)/dashboard|onboarding|…     → auth guard + app shell

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

ui/                              → wrappers Mantine por categoria
  DataDisplay | DataEntry | Feedback | Layout | Navigation | General
```

## Fluxo de dados

```
Page (app/) → presentation/modules → ui/
                                    → core/services/usecases/index.hooks
                                    → *.usecase → core/infra/http (axios)
                                    → core/domain
```

## Integração server

- Cookie HttpOnly `po_auth` + antiforgery em mutações
- `X-Family-Id` via `FamilyProvider` + `family-context`
- next-intl com `localePrefix: 'never'` (pt-BR fixo)

## Layout

Desktop-first admin PWA — ver [`.specs/design/DESIGN.md`](../../design/DESIGN.md) §6.

## Fase ponte

Até mobile M0, `web/` implementa todas as features consumer do MVP. Após M0, consumer features migram para `mobile/`; `web/` mantém gestão admin.
