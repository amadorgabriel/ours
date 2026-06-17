# Conventions — Mobile

Pacote: `mobile/` · Padrão: ec-v3-ui parity com `web/`

## Stack

Expo Router · TypeScript · NativeWind · TanStack Query · Axios · Zod · Jest

## Estrutura `src/`

```
app/                             # Expo Router
core/domain/<entity>/
  index.ts
  index.contract.ts
core/infra/http/                 # Axios + Bearer interceptor
core/infra/query/
core/infra/storage/              # secure-store
core/services/usecases/<entity>/
presentation/modules/<feature>/
presentation/providers/
ui/{DataDisplay,DataEntry,Feedback,Layout,Navigation,General}/
```

## Regras

- Modules importam de `@/ui/*`, nunca componentes RN crus para UI repetível
- Zero hex em modules — tokens NativeWind de `presentation/styles/tokens.ts`
- Hooks de dados em `core/services/usecases/*/index.hooks.ts`
- Strings via i18next (`pt-BR`)
- Auth token via `core/infra/storage/auth-storage.ts`

## HTTP

```typescript
const http = HttpClientFactory.create(); // axios, Bearer + X-Family-Id
```

## Providers

`RootProvider` = Query → Auth → Family → Assistido

## Nomenclatura

- **Assistido** = Parent (entidade de domínio)
- Rotas Expo Router: `(auth)/`, `(app)/`
- Guards: `AuthGuard`, `GuestGuard` em layouts

## Design

Obrigatório: [`.specs/design/mobile.md`](../../design/mobile.md) + tokens [DESIGN.md](../../design/DESIGN.md)
