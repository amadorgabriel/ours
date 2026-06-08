# Audit — Client Structure (2026-06-08)

Referência: `ec-v3-ui` · Resultado: **reestruturado**

## Checklist

| Requisito | Status | Path |
|-----------|--------|------|
| App Router | ✅ | `src/app/[locale]/` |
| proxy.ts (não middleware.ts) | ✅ | `src/proxy.ts` |
| core/domain (models, req/res) | ✅ | `core/domain/auth`, `core/domain/family` |
| core/infra (axios + react query) | ✅ | `core/infra/http`, `core/infra/query` |
| core/services (usecases + mocks) | ✅ | `core/services/usecases/auth/` |
| presentation/hooks | ✅ | `presentation/hooks/useIsClient` |
| presentation/modules | ✅ | `presentation/modules/home`, `dev-theme` |
| presentation/providers (Context) | ✅ | `presentation/providers/` |
| presentation/styles | ✅ | `presentation/styles/globals.css` |
| ui/ segregado | ✅ | `ui/DataDisplay`, `DataEntry`, `Feedback`, `Layout`, `General` |
| Testes | ✅ | 6 arquivos, 10 testes |

## Removido

- `src/modules/` (layout antigo)
- `src/core/presentation/`
- `src/core/infrastructure/`
- `src/stores/` (Zustand → Context `FamilyProvider`)

> Pastas vazias fisicamente removidas no change **002-cleanup-theme-folders**.

## Gates

- `npm run test:run` — 10/10
- `npm run lint` — ok
- `npm run type-check` — ok
- `npm run build` — ok
