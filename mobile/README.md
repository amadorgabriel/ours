# Project Ours — Mobile

**Status:** scaffold ativo (Change 007, T1–T4) · **Expo SDK 56** · development builds

## Papel

Cliente **principal** do Project Ours. Experiência diária dos cuidadores:

- Onboarding e autenticação
- Feed de atividades da família
- Registrar ligações ("Liguei agora")
- Calendário mensal de cuidado
- Metas financeiras (visão agregada)
- Seletor de assistido (Pai, Mãe)

## Stack

**Expo SDK 56 · React Native · TypeScript · Expo Router · expo-dev-client**

Próximo: NativeWind, TanStack Query, secure-store (T5+)

Detalhes: [`.specs/platforms/mobile/STACK.md`](../.specs/platforms/mobile/STACK.md)

## Desenvolvimento

Este projeto usa **development builds** via **EAS** (não Expo Go).

### Pré-requisitos (uma vez)

```bash
npm install -g eas-cli
eas login
cd mobile && npm install
```

O projeto já está linkado: [@amadorgabriel/project-ours](https://expo.dev/accounts/amadorgabriel/projects/project-ours)

### 1. Gerar o dev client (primeira vez ou após mudança nativa)

**Android** (emulador ou dispositivo físico):

```bash
cd mobile
npm run build:dev:android
# ou: eas build --profile development --platform android
```

**iOS simulador** (macOS):

```bash
npm run build:dev:ios
```

**iOS dispositivo físico**:

```bash
npm run build:dev:ios-device
```

O EAS compila na nuvem. Ao terminar, baixe o `.apk` / `.ipa` pelo link no terminal ou em [expo.dev](https://expo.dev) → Builds → instale no dispositivo/emulador.

Build local (sem nuvem, requer Android SDK / Xcode):

```bash
eas build --profile development --platform android --local
```

### 2. Rodar o app no dia a dia

Com o dev client já instalado:

```bash
cd mobile
cp .env.example .env.local   # ajustar vars se necessário
npm run start                # Metro com --dev-client
```

Abra o app **Project Ours** (dev client) no celular — ele conecta ao Metro na sua rede.

### Alternativa local (sem EAS)

Se tiver Android Studio / Xcode configurado:

```bash
npm run android   # compila e instala localmente
npm run start
```

### Gates

```bash
npm run test
npm run type-check
npm run lint
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | Base URL da API REST (ex.: `http://localhost:5000/api`) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth Web client ID (Google Sign-In) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | OAuth Android client ID |

## Features (specs)

| Feature | Spec mobile |
|---------|-------------|
| Auth | [`.specs/features/auth/mobile.md`](../.specs/features/auth/mobile.md) |
| Family | [`.specs/features/family/mobile.md`](../.specs/features/family/mobile.md) |

## API

Mesma API REST em `server/`. Auth: Bearer JWT (não cookie).
