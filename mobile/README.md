# Project Ours — Mobile

**Status:** stack e specs definidos — implementação pendente (M6)

## Papel

Cliente **principal** do Project Ours. Experiência diária dos cuidadores:

- Onboarding e autenticação
- Feed de atividades da família
- Registrar ligações ("Liguei agora")
- Calendário mensal de cuidado
- Metas financeiras (visão agregada)
- Seletor de assistido (Pai, Mãe)

## Stack

**Expo SDK 52+ · React Native · TypeScript · NativeWind · TanStack Query**

Detalhes: [`.specs/platforms/mobile/STACK.md`](../.specs/platforms/mobile/STACK.md)

## Arquitetura

Padrão ec-v3-ui parity com `web/`: `core/domain` → `core/infra` → `presentation/modules` → `ui/`

Detalhes: [`.specs/platforms/mobile/ARCHITECTURE.md`](../.specs/platforms/mobile/ARCHITECTURE.md)

## Design

- Tokens: [`.specs/design/DESIGN.md`](../.specs/design/DESIGN.md)
- Layouts mobile: [`.specs/design/mobile.md`](../.specs/design/mobile.md)

## Features (specs para M6)

| Feature | Spec mobile |
|---------|-------------|
| Auth | [`.specs/features/auth/mobile.md`](../.specs/features/auth/mobile.md) |
| Family | [`.specs/features/family/mobile.md`](../.specs/features/family/mobile.md) |

## API

Mesma API REST em `server/`. Contratos: [`.specs/shared/api-contracts.md`](../.specs/shared/api-contracts.md)

Auth: Bearer JWT (não cookie).

## Desenvolvimento

Nenhum comando até scaffold M6. Para trabalho ativo no frontend, use `web/` (fase ponte).

```bash
# Quando M6 iniciar:
cd mobile && npm install && npx expo start
```
