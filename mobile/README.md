# Project Ours — Mobile

**Status:** scaffold + app shell + feed + calendar + goals + contributions + parents + parent detail + polish + notifications (Changes 007–016) · **Expo SDK 56** · development builds

## Papel

Cliente **principal** do Project Ours. Experiência diária dos cuidadores:

- Onboarding e autenticação
- Feed de atividades da família
- Registrar ligações ("Liguei agora")
- Calendário mensal de cuidado
- Metas financeiras (visão agregada)
- Contribuições em metas (com privacidade opcional)
- Cadastro de assistidos (Pai/Mãe) + seletor no header
- Ficha do assistido (info médica + briefing de emergência)
- Empty states e retry de erros padronizados (`EmptyState`, `QueryErrorState`)
- Lembretes locais configuráveis no Perfil + registro de push token no server

## Stack

**Expo SDK 56 · React Native · TypeScript · Expo Router · NativeWind 4 · TanStack Query · expo-secure-store · expo-notifications · expo-dev-client**

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
| Registrar ligação ("Liguei agora") | `CallNowSheet` · FAB `RegisterActivityFab` (Change 025) |
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

## Implementado (Change 013)

| Área | Rotas / módulos |
|------|-----------------|
| Listar assistidos | `AssistidoSheet` · `GET /parents` |
| Criar/editar assistido (admin) | `CreateParentSheet` · `EditParentSheet` · Perfil |
| API parents | `GET/POST /parents` · `PUT /parents/{id}` (server) |

Spec: [`.specs/changes/013-mobile-parents/`](../.specs/changes/013-mobile-parents/)

## Implementado (Change 014)

| Área | Rotas / módulos |
|------|-----------------|
| Ficha do assistido (leitura) | `ParentDetailSheet` · Perfil (membro + admin) |
| Editar info médica / emergência (admin) | `ParentDetailSheet` modo edição |
| API parent detail | `GET /parents/{id}` · `PUT` estendido (server) |

Spec: [`.specs/changes/014-mobile-parent-detail/`](../.specs/changes/014-mobile-parent-detail/)

## Implementado (Change 015)

| Área | Rotas / módulos |
|------|-----------------|
| Empty states padronizados | `ui/Feedback/EmptyState` · feed, metas, calendário, assistidos, perfil |
| Erro com retry | `ui/Feedback/QueryErrorState` · feed, metas, calendário, perfil, ficha |
| Pull-to-refresh ampliado | Perfil · `ParentDetailSheet` |

Spec: [`.specs/changes/015-mobile-polish/`](../.specs/changes/015-mobile-polish/)

## Implementado (Change 025 — Refinement 2.0)

| Área | Rotas / módulos |
|------|-----------------|
| Assistido: prefetch, auto-select, filtro feed/calendário | `AssistidoProvider` · `AssistidoSheet` ("Todos os assistidos") |
| Shell: 4 tabs + swipe + FAB | `TabPagerLayout` · `WaveTabBar` · `RegisterActivityFab` |
| Feed: badge não lidas, ticks "visto", visita com foto | `ActivityCard` · `VisitSheet` · `POST /activities/visit` |
| Perfil: membros (foto/remover), nova família, foto assistido | `CreateFamilySheet` · `EditParentSheet` (foto) |
| Auth: `GoogleSignin.signOut` · confirmação logout | `useLogout` · Perfil |
| UX: teclado nos drawers · loading calendário localizado | `BottomSheet` · `CalendarGrid` |

Spec: [`.specs/changes/025-refinement-2.0/`](../.specs/changes/025-refinement-2.0/)

## Implementado (Change 028 — Auth account switch)

| Área | Rotas / módulos |
|------|-----------------|
| Logout Google: `signOut` + `revokeAccess` (best-effort) | `clearGoogleSignInSession` · `useLogout` |
| Login: forçar seletor de conta | `prepareGoogleSignInForAccountPicker` · `LoginScreen` |
| Perfil: botão sair destrutivo | `ProfileScreen` (texto vermelho, sem borda) |

Spec: [`.specs/changes/028-mobile-auth-account-switch/`](../.specs/changes/028-mobile-auth-account-switch/)

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

Abra o app **Ours** (dev client) no celular — conecta ao Metro na sua rede.

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

### Ícones e splash

Fonte versionada: `assets/images/logo-master.png` (logo 021, 1024px). Após alterar o master, regenere os derivados:

```bash
python scripts/generate-icons.py
```

Gera `icon.png`, `splash-icon.png`, `favicon.png`, `logo-ours.png` (login) e adaptive icons Android (`android-icon-*.png`) com padding cream `#FCF8F4` (AD-001).

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | Base URL da API REST (ex.: `http://localhost:5280/api`) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth Web client ID (Google Sign-In — idToken) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | OAuth Android client ID (SHA-1 no Google Console) |
| `EXPO_PUBLIC_INVITE_BASE_URL` | Base URL para links de convite (ex.: `http://localhost:3000/join`) — usado pelo `InviteSheet` e pela página web `/join/[code]` |

### Testar convite em dev (RF-54)

1. Defina `EXPO_PUBLIC_INVITE_BASE_URL` apontando para o `web/` local (ex.: `http://localhost:3000/join`).
2. No app (Perfil → Convidar familiar), gere um código e use **Compartilhar** ou copie o link.
3. Abra o link no navegador: a rota web `/join/[code]` deve aceitar o código e permitir entrar na família.

Template: [`.env.example`](.env.example)

## Deploy / EAS (change 035 — free tier)

**Constraint AD-013:** só EAS free (builds serializados; sem priority / multi-build pago).  
**Constraint AD-012:** sem domínio `ours.app` — use Quick Tunnel ou placeholder; target futuro abaixo.

### Perfil `preview-apk`

Em [`eas.json`](./eas.json): distribution `internal`, `android.buildType: apk`. Placeholders no perfil apontam para `*.trycloudflare.com` — **sobrescreva** no [Expo dashboard](https://expo.dev) (Environment variables / EAS Secrets) com a URL real do tunnel:

| Env | Agora (sem domínio) | Target futuro |
|-----|---------------------|---------------|
| `EXPO_PUBLIC_API_URL` | `https://<subdomain>.trycloudflare.com/api` | `https://api.ours.app/api` |
| `EXPO_PUBLIC_INVITE_BASE_URL` | placeholder / trycloudflare `/join` até Pages (T13 blocked) | `https://ours.app/join` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth Web client ID (público; no perfil `preview-apk` em `eas.json`) | mesmo client (prod) |

**Google Sign-In no APK:** o perfil `preview-apk` injeta `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (obrigatório para idToken). Client IDs IOS/ANDROID vazios não vão no perfil. SHA-1 do keystore release deve estar no OAuth Android (`com.projectours.app`) — ver T12.

Build local (operador):

```bash
cd mobile
eas build --profile preview-apk --platform android
```

### GitHub Actions — `release-apk.yml`

Tag `v*` (ex.: `v0.1.0-beta.1`) ou **workflow_dispatch** → EAS `preview-apk` → GitHub Release com APK.

| Secret | Obrigatório? | Notas |
|--------|--------------|--------|
| `EXPO_TOKEN` | **Sim** | [expo.dev](https://expo.dev) → Account → Access tokens |
| `ANDROID_KEYSTORE_BASE64` | Não* | *Se EAS gerencia credentials, pule. Para keystore próprio: base64 do `.jks`/`.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Não* | Com keystore próprio |
| `ANDROID_KEY_ALIAS` | Não* | Com keystore próprio |
| `ANDROID_KEY_PASSWORD` | Não* | Se diferente da keystore |

**Keystore one-time (recomendado free tier):** `eas credentials` (interativo) deixa o EAS gerar/armazenar o keystore Android. **SHA-1** do keystore release → Google Cloud Console → OAuth Android client, package `com.projectours.app` (T12).

**T12 (2026-07-29):** SHA-1 do keystore release já registrado no Google Console. Smoke Google Sign-In no APK pendente após rebuild com `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` no perfil `preview-apk`.

Lista infra: [`scripts/infra/README.md`](../scripts/infra/README.md).

## API

Mesma API REST em `server/`. Auth mobile: **Bearer JWT** no header `Authorization` + `X-Family-Id` para contexto de família (sem cookie/antiforgery do web).
