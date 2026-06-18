# Project Ours — Mobile

**Status:** scaffold + app shell + feed + calendar + goals + contributions (Changes 007–012) · **Expo SDK 56** · development builds

## Papel

Cliente **principal** do Project Ours. Experiência diária dos cuidadores:

- Onboarding e autenticação
- Feed de atividades da família
- Registrar ligações ("Liguei agora")
- Calendário mensal de cuidado
- Metas financeiras (visão agregada)
- Contribuições em metas (com privacidade opcional)
- Seletor de assistido (Pai, Mãe)

## Stack

**Expo SDK 56 · React Native · TypeScript · Expo Router · NativeWind 4 · TanStack Query · expo-secure-store · expo-dev-client**

Arquitetura alinhada ao `web/`: `core/` (domain, infra, usecases) → `presentation/` (providers, modules) → `ui/`.

| Doc | Path |
|-----|------|
| Stack | [`.specs/platforms/mobile/STACK.md`](../.specs/platforms/mobile/STACK.md) |
| Estrutura | [`.specs/platforms/mobile/STRUCTURE.md`](../.specs/platforms/mobile/STRUCTURE.md) |
| Arquitetura | [`.specs/platforms/mobile/ARCHITECTURE.md`](../.specs/platforms/mobile/ARCHITECTURE.md) |
| Convenções | [`.specs/platforms/mobile/CONVENTIONS.md`](../.specs/platforms/mobile/CONVENTIONS.md) |

## Implementado (Change 007)

| Área | Rotas / módulos |
|------|-----------------|
| Auth Google + restore sessão | `/(auth)/login` |
| Onboarding família (criar / entrar código) | `/(auth)/onboarding` |
| Seletor multi-família | `/(app)/families/select` |
| Shell com tabs + WaveTabBar | `/(app)/(tabs)/*` |

Specs: [auth/mobile.md](../.specs/features/auth/mobile.md) · [family/mobile.md](../.specs/features/family/mobile.md)

## Implementado (Change 008)

| Área | Rotas / módulos |
|------|-----------------|
| Header global (chips família + assistido) | `AppHeader` em `/(app)/(tabs)/_layout` |
| Bottom sheet reutilizável | `ui/Feedback/BottomSheet/` |
| Admin convite (gerar / copiar / compartilhar) | `InviteSheet` · Perfil (Admin) |
| Seletor assistido + persist | `AssistidoProvider` · `AssistidoSheet` |
| Perfil (dados, família, logout) | `/(app)/(tabs)/profile` |

Spec: [`.specs/changes/008-mobile-app-shell/`](../.specs/changes/008-mobile-app-shell/)

## Implementado (Change 009)

| Área | Rotas / módulos |
|------|-----------------|
| Feed cronológico de atividades | `/(app)/(tabs)/index` · `presentation/modules/feed` |
| Registrar ligação ("Liguei agora") | `CallNowSheet` · botão central WaveTabBar |
| API activities | `GET /activities/feed` · `POST /activities/call` (server) |

Spec: [`.specs/changes/009-mobile-feed/`](../.specs/changes/009-mobile-feed/)

## Implementado (Change 010)

| Área | Rotas / módulos |
|------|-----------------|
| Calendário mensal com dots | `/(app)/(tabs)/calendar` · `presentation/modules/calendar` |
| Detalhe do dia | `DayDetailSheet` · reutiliza `ActivityCard` |
| Feed por intervalo | `GET /activities/feed?from=&to=` (server) |

Spec: [`.specs/changes/010-mobile-calendar/`](../.specs/changes/010-mobile-calendar/)

## Implementado (Change 011)

| Área | Rotas / módulos |
|------|-----------------|
| Lista de metas financeiras | `/(app)/(tabs)/goals` · `presentation/modules/goals` |
| Criar meta (admin) | `CreateGoalSheet` |
| Detalhe da meta | `GoalDetailSheet` · `GoalCard` com barra de progresso |
| API goals | `GET /goals` · `POST /goals` (server) |

Spec: [`.specs/changes/011-mobile-goals/`](../.specs/changes/011-mobile-goals/)

## Implementado (Change 012)

| Área | Rotas / módulos |
|------|-----------------|
| Registrar contribuição | `ContributeSheet` · toggle privacidade |
| Histórico no detalhe | `GoalDetailSheet` · lista contribuições visíveis |
| API contributions | `GET/POST /goals/{id}/contributions` (server) |

Spec: [`.specs/changes/012-mobile-goals-contributions/`](../.specs/changes/012-mobile-goals-contributions/)

## Desenvolvimento

Este projeto usa **development builds** via **EAS** (não Expo Go).

### Pré-requisitos (uma vez)

```bash
npm install -g eas-cli
eas login
cd mobile && npm install
cp .env.example .env.local   # ajustar API URL e Google client IDs
```

O projeto está linkado: [@amadorgabriel/project-ours](https://expo.dev/accounts/amadorgabriel/projects/project-ours)

### 1. Gerar o dev client (primeira vez ou após mudança nativa)

**Android** (emulador ou dispositivo físico):

```bash
cd mobile
npm run build:dev:android
```

**iOS simulador** (macOS):

```bash
npm run build:dev:ios
```

**iOS dispositivo físico**:

```bash
npm run build:dev:ios-device
```

O EAS compila na nuvem. Baixe o `.apk` / `.ipa` em [expo.dev](https://expo.dev) → Builds → instale no dispositivo/emulador.

Build local (requer Android SDK / Xcode):

```bash
eas build --profile development --platform android --local
```

### 2. Rodar no dia a dia

Com o dev client instalado e a API (`server/`) acessível:

```bash
cd mobile
npm run start                # Metro com --dev-client
```

Abra o app **Project Ours** (dev client) no celular — conecta ao Metro na sua rede.

**Android emulador:** use `10.0.2.2` em vez de `localhost` na `EXPO_PUBLIC_API_URL`.

### Alternativa local (sem EAS)

Com Android Studio / Xcode configurado:

```bash
npm run android   # ou npm run ios
npm run start
```

### Gates (CI / pre-merge)

```bash
cd mobile
npm run test && npm run type-check
npm run lint      # opcional
```

Gate documentado nos changes: [007](../.specs/archive/007-mobile-scaffold/) · [008](../.specs/changes/008-mobile-app-shell/) · [009](../.specs/changes/009-mobile-feed/)

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | Base URL da API REST (ex.: `http://localhost:5280/api`) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth Web client ID (Google Sign-In — idToken) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | OAuth Android client ID (SHA-1 no Google Console) |

Template: [`.env.example`](.env.example)

## API

Mesma API REST em `server/`. Auth mobile: **Bearer JWT** no header `Authorization` + `X-Family-Id` para contexto de família (sem cookie/antiforgery do web).
