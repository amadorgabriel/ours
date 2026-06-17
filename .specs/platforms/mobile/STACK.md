# Tech Stack — Mobile

**Pacote:** `mobile/` · **Papel:** Cliente principal (uso diário dos irmãos)  
**Última atualização:** 2026-06-17 · **Status:** definido — implementação pendente (M6)

## Decisão

**Expo (managed workflow) + React Native + TypeScript** — alinhado ao ecossistema do `web/` (TypeScript, TanStack Query, Zod, padrão domain/infra/presentation).

## Runtime

| Camada | Tecnologia | Notas |
|--------|------------|-------|
| Framework | Expo SDK 52+ | Managed workflow, EAS Build para stores |
| Navigation | Expo Router | File-based routing (paridade mental com Next.js) |
| Language | TypeScript | 5.x |
| UI | NativeWind 4 + componentes custom `ui/` | Tokens de `.specs/design/` via CSS vars |
| Icons | @expo/vector-icons + Tabler (SVG) | Consistência visual com web |
| i18n | expo-localization + i18next | `pt-BR` default |
| State | Context API (auth, family, assistido) | Mesmo padrão do web |
| Data | TanStack Query + Axios | 5.x |
| Validation | Zod | 4.x |
| Secure storage | expo-secure-store | JWT / refresh token |
| Auth Google | @react-native-google-signin/google-signin | IdToken → `POST /api/auth/google` |
| Tests | Jest + React Native Testing Library | — |

## Auth (diferença do web)

| Aspecto | Web | Mobile |
|---------|-----|--------|
| Transporte | Cookie HttpOnly `po_auth` | Bearer token em `Authorization` |
| Storage | Cookie (browser) | `expo-secure-store` |
| CSRF | Antiforgery token | Não aplicável (Bearer) |
| Google | `@react-oauth/google` | `@react-native-google-signin/google-signin` |

> **Server:** endpoint `POST /api/auth/google` já retorna session; mobile persistirá JWT do response body (ou endpoint dedicado `?platform=mobile` se necessário — ver feature auth mobile).

## Gate (quando implementado)

```bash
cd mobile && npm run test && npm run type-check
```

## Referências

- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Design mobile: [`.specs/design/mobile.md`](../../design/mobile.md)
- Tokens compartilhados: [`.specs/design/DESIGN.md`](../../design/DESIGN.md)
