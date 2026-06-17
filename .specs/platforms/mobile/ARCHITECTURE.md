# Architecture — Mobile

**Pacote:** `mobile/` · **Status:** especificado — código pendente (M6)  
**Padrão:** ec-v3-ui parity (mesma separação domain/infra/presentation do `web/`)

## Camadas (alvo)

```
mobile/src/
  app/                           → Expo Router (file-based)
    (auth)/login.tsx             → guest guard
    (app)/                       → auth guard + tab shell
      index.tsx                  → feed / home
      calendar.tsx               → visão mensal
      goals/                     → metas financeiras
      profile/                   → perfil assistido
    _layout.tsx                  → RootProvider

  core/domain/<entity>/
    index.ts                     → Models, Request/Response
    index.contract.ts            → I<Entity>

  core/infra/
    http/                        → Axios (Bearer + X-Family-Id)
    query/                       → queryClient + queryKeys
    storage/                     → secure-store wrapper (auth token)

  core/services/usecases/<entity>/
    *.usecase.ts
    index.hooks.ts
    index.mock.ts

  presentation/
    hooks/
    modules/<feature>/           → telas por feature
    providers/                   → Query, Auth, Family, Assistido
    styles/                      → tokens NativeWind

  ui/                            → design system RN
    DataDisplay | DataEntry | Feedback | Layout | Navigation | General
```

## Fluxo de dados

```
Screen (app/) → presentation/modules → ui/
                                     → core/services/usecases/index.hooks
                                     → *.usecase → core/infra/http
                                     → core/domain
```

## Navegação

- **Tab bar:** Wave Tab Bar (`.specs/design/mobile.md` §2) — 5 abas principais
- **Stack:** modais e fluxos (onboarding, criar meta, registrar ligação)
- **Assistido ativo:** seletor global no header ou sheet

## Integração server

| Header / mecanismo | Uso |
|--------------------|-----|
| `Authorization: Bearer {jwt}` | Todas as requisições autenticadas |
| `X-Family-Id: {uuid}` | Escopo familiar |
| `POST /api/auth/google` | Login com Google idToken |

Token persistido em `expo-secure-store`; restore na abertura do app via `GET /auth/me`.

## Smart routing pós-login

Mesma lógica do web (`resolvePostLoginRoute`):

| `familyCount` | Destino |
|---------------|---------|
| 0 | Onboarding (criar ou entrar) |
| 1 | Home/Feed com família ativa |
| > 1 | Seletor de família |

## Diferenças vs web

| Aspecto | Mobile | Web |
|---------|--------|-----|
| Layout | Mobile-first, bottom tab | Desktop-first, sidebar |
| Auth | Bearer + secure store | Cookie + antiforgery |
| Navegação | Expo Router + tabs | Next.js App Router |
| UI lib | NativeWind + `ui/` custom | Mantine + Tailwind |

## Shared logic (oportunidade futura)

Models Zod, tipos de domínio e regras de roteamento podem extrair para pacote `packages/shared/` no monorepo — **fora do escopo M6 inicial**.
