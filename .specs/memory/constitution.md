# Constitution — Project Ours

Princípios não negociáveis. Todo change em `.specs/changes/` e feature em `.specs/features/` deve respeitar esta constituição.

## Produto

1. **Sem rankings** — a UI nunca compara irmãos entre si.
2. **Privacidade em metas** — progresso agregado apenas; valor individual de outro membro nunca é exposto.
3. **Colaboração explícita** — feed mostra quem fez o quê, não placares.
4. **Multi-família** — contexto de família ativa é obrigatório em operações com escopo familiar.

## Engenharia

1. **Spec-first** — nenhuma feature sem critérios de aceitação em `.specs/`.
2. **Clean architecture no client** — `presentation → application → domain`; `infrastructure` implementa portas.
3. **i18n obrigatório** — strings de UI só via next-intl (`pt-BR` default).
4. **Testes no gate** — Vitest (client), xUnit (server); hooks Husky não são opcionais.
5. **Simplicidade** — sem overengineering; diff mínimo que resolve o requisito.

## Segurança

1. Auth no browser: cookie HttpOnly + antiforgery em mutações.
2. Papéis Admin/Member da API, não do JWT no client.
3. Header `X-Family-Id` em endpoints com escopo de família.

## Processo (SDD)

```text
changes/NNN-slug/  →  proposta ativa (Open Spec)
features/slug/     →  especificação de produto (TLC)
codebase/          →  mapa brownfield
project/           →  visão e roadmap
```

Antes de implementar: ler `PROJECT.md`, `constitution.md` e spec da feature/change relevante.
