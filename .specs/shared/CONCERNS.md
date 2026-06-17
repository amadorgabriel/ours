# Concerns (cross-platform)

Áreas frágeis ou com dívida técnica. Consultar ao planejar features.

## Web (`web/`)

| Área | Risco | Detalhe |
|------|-------|---------|
| Módulos family/goals/activities | Baixo | Stubs parciais — M2 em progresso |
| E2E | Médio | Playwright planejado |
| Google OAuth em dev | Baixo | Sem `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, erro amigável |
| Papel admin vs consumer | Baixo | Fase ponte: web faz tudo; poda pós-mobile M6 |

## Mobile (`mobile/`)

| Área | Risco | Detalhe |
|------|-------|---------|
| Código inexistente | Alto | Apenas README; M6 pendente |
| Auth Bearer no server | Médio | Middleware pode precisar extensão para mobile |
| Google Sign-In nativo | Médio | Config iOS/Android + Expo |

## Server

| Área | Risco | Detalhe |
|------|-------|---------|
| JWT signing key | Médio | Dev key em appsettings; produção via env |
| Bearer auth | Médio | Cookie-first hoje; mobile precisa Bearer |
| Migrations | Baixo | EF migrations pendentes de versionar |
| Deploy | Médio | Sem Dockerfile no repo |

## Referências externas

- ec-v3-ui: `c:\_git\job\ec\ec-v3-ui` — padrão web/mobile
