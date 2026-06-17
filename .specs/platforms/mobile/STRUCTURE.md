# Repository Structure — Mobile

**Status:** placeholder — estrutura alvo para M6

```
mobile/
├── app.json                   # Expo config
├── src/
│   ├── app/                   # Expo Router
│   │   ├── _layout.tsx
│   │   ├── (auth)/login.tsx
│   │   └── (app)/
│   │       ├── _layout.tsx    # tab shell + WaveTabBar
│   │       ├── index.tsx      # feed
│   │       ├── calendar.tsx
│   │       ├── goals/
│   │       └── profile/
│   ├── core/
│   │   ├── domain/
│   │   ├── infra/http|query|storage/
│   │   └── services/usecases/
│   ├── presentation/
│   │   ├── modules/
│   │   ├── providers/
│   │   └── styles/
│   └── ui/
├── assets/
└── package.json
```

## Camadas

| Camada | Path | Exemplo |
|--------|------|---------|
| Domain | `core/domain/auth/` | `AuthSessionModel` |
| Infra | `core/infra/storage/` | `auth-storage.ts` |
| Services | `core/services/usecases/auth/` | `login-google.usecase.ts` |
| Presentation | `presentation/modules/login/` | `LoginScreen` |
| UI | `ui/Navigation/WaveTabBar/` | tab bar |

## Estado atual

Apenas `mobile/README.md` — sem código até M6.
