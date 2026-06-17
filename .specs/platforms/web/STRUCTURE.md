# Repository Structure — Web

```
web/src/
├── app/                       # App Router (URLs diretas)
├── core/
│   ├── domain/auth|family/
│   ├── infra/http|query/
│   └── services/usecases/
├── presentation/
│   ├── modules/
│   ├── providers/
│   └── styles/
├── ui/                        # Mantine wrappers
└── i18n/
```

## Camadas

| Camada | Path | Exemplo |
|--------|------|---------|
| Domain | `core/domain/auth/` | `AuthSessionModel`, `IAuth` |
| Infra | `core/infra/http/` | `HttpClient` (axios) |
| Services | `core/services/usecases/auth/` | `login-google.usecase.ts` |
| Presentation | `presentation/modules/home/` | `HomePage` |
| UI | `ui/DataDisplay/Button/` | re-export Mantine |

## Testes (10+ specs)

- `core/infra/http/*.test.ts`
- `core/services/usecases/auth/*.test.ts`
- `presentation/providers/family/*.test.tsx`
