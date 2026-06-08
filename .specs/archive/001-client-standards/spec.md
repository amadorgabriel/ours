# Client Standards — Specification

## Problem Statement

Agentes e devs não têm um gate único que prove que `client/` segue o mesmo padrão de um frontend maduro (referência desejada: ec-v3-ui). Hoje há tooling, mas HTTP e módulos estão incompletos.

## Goals

- [ ] `client/` passa checklist automatizado e manual de CONVENTIONS.md
- [ ] Primeiro módulo completo (`auth`) serve de template para os demais

## Acceptance Criteria

1. WHEN `httpClient` é usado THEN SHALL usar `withCredentials: true` e `baseURL` `/api` (ou env documentado)
2. WHEN mutação HTTP THEN SHALL incluir `RequestVerificationToken` obtido de `/auth/antiforgery`
3. WHEN request com escopo familiar THEN SHALL incluir `X-Family-Id` da store ativa
4. WHEN resposta 401 THEN interceptor SHALL redirecionar para login
5. WHEN novo código em `modules/auth` THEN SHALL existir domain, application, infrastructure, presentation
6. WHEN string exibida na UI THEN SHALL vir de next-intl
7. WHEN PR aberto no client THEN Husky pre-commit e pre-push SHALL passar

## Requirement Traceability

| ID | Critério | Status |
|----|----------|--------|
| STD-01 | HTTP withCredentials + baseURL | Verified |
| STD-02 | Antiforgery em mutações | Verified |
| STD-03 | X-Family-Id interceptor | Verified |
| STD-04 | 401 redirect | Verified |
| STD-05 | auth usecases + domain + hooks | Verified |
| STD-06 | i18n only | Verified |
| STD-07 | hooks CI local | Verified |

## Out of Scope

- Implementar features de família/metas (só estrutura padrão)
- Playwright E2E neste change
- Copiar arquivos literalmente de ec-v3-ui (repo não disponível)
