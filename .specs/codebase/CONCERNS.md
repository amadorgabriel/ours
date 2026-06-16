# Concerns

Áreas frágeis ou com dívida técnica conhecida.

## Web (`web/`)

| Área | Risco | Detalhe |
|------|-------|---------|
| Rename `client/` → `web/` | — | Concluído (change 006) |
| Módulos family/goals/activities | Baixo | Stubs sem implementação — esperado pré-MVP |
| E2E | Médio | Playwright planejado; fluxos auth cobertos só por unit + manual |
| Google OAuth em dev | Baixo | Sem `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, login mostra erro amigável; mock no server só em Development/Testing |
| Papel admin vs consumer | Baixo | Fase ponte: web faz tudo; poda consumer pós-mobile M0 |

## Mobile (`mobile/`)

| Área | Risco | Detalhe |
|------|-------|---------|
| Stack indefinida | Alto | Placeholder apenas; auth strategy mobile TBD |

## Server

| Área | Risco | Detalhe |
|------|-------|---------|
| JWT signing key | Médio | `appsettings.json` traz chave de dev; produção deve usar secret/env |
| Migrations | Baixo | Schema em código; migrations EF pendentes de versionar |
| Deploy | Médio | Sem Dockerfile/compose no repo ainda; VPS Docker planejado (ver STACK.md) |

## Documentação (resolvido 2026-06-08)

- PRD duplicado em `_docs/` — removido; canonical em `.specs/`
- `_docs/` deprecado em favor de `.specs/`
- HTTP client legado (`client.ts` sem credentials/antiforgery) — substituído por `core/infra/http/`
- Módulo auth stub — implementado em `core/domain/auth` + use cases + guards

## ec-v3-ui

Referência documentada em `.specs/codebase/CONVENTIONS.md` (skill `ours-client-standard`). Web alinhado ao padrão domain/infra/presentation.
