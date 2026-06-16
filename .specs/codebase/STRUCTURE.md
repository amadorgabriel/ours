# Repository Structure

```
project-ours/
├── .specs/
├── .cursor/skills/ours-client-standard/
├── mobile/                        # placeholder — app principal (futuro)
│   └── README.md
├── web/src/                       # PWA admin (ex-client/)
│   ├── app/                       # App Router (URLs diretas)
│   ├── core/
│   │   ├── domain/auth|family/
│   │   ├── infra/http|query/
│   │   └── services/usecases/
│   ├── presentation/
│   │   ├── modules/home/
│   │   ├── providers/
│   │   └── styles/
│   ├── ui/                        # Mantine wrappers por categoria
│   └── i18n/
└── server/
```
## Camadas web

| Camada | Path | Exemplo |
|--------|------|---------|
| Domain | `core/domain/auth/` | `AuthSessionModel`, `IAuth` |
| Infra | `core/infra/http/` | `HttpClient` (axios) |
| Services | `core/services/usecases/auth/` | `login-google.usecase.ts` |
| Presentation | `presentation/modules/home/` | `HomePage` |
| UI | `ui/DataDisplay/Button/` | re-export Mantine |

## Testes web (10 specs)

- `core/infra/http/*.test.ts`
- `core/infra/query/query-keys.test.ts`
- `core/services/usecases/auth/*.test.ts`
- `presentation/providers/family/*.test.tsx`

## Shared specs

- `.specs/shared/platforms.md` — responsabilidades mobile vs web
- `.specs/design/DESIGN.md` — tokens UI (web hoje; mobile futuro)
