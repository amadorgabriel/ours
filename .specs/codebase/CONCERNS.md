# Concerns

Áreas frágeis ou com dívida técnica conhecida.

## Client

| Área | Risco | Detalhe |
|------|-------|---------|
| HTTP client | Alto | `client.ts` usa `NEXT_PUBLIC_API_URL` sem `withCredentials`, antiforgery ou `X-Family-Id` |
| Módulo auth | Médio | Só exporta tipos; camadas application/infrastructure/presentation ausentes |
| Módulos family/goals/activities | Baixo | Stubs sem implementação — esperado pré-MVP |
| PRD vs client-standard | Médio | PRD antigo menciona JWT Bearer; padrão atual é cookie HttpOnly |
| Referências quebradas | Baixo | `client-standard.md` apontava `_docs/02-reference/*` inexistentes |

## Server

| Área | Risco | Detalhe |
|------|-------|---------|
| OAuth Google | Médio | Estrutura pronta; validação id_token em evolução |
| Migrations | Baixo | Schema em código; migrations EF pendentes de versionar |

## Documentação (resolvido 2026-06-08)

- PRD duplicado em `_docs/` e `_docs/_draft/`
- Prompts de setup duplicando client-standard
- `_docs/` deprecado em favor de `.specs/`

## ec-v3-ui

Repositório de referência não localizado. Padrão derivado de `client-standard` + estrutura atual até path ser fornecido.
