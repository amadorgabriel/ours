# Smoke — Change 005 Design Specification

Checklist manual após implementação T1–T10.

## Visual

- [x] Fundo da app é cream (`#FCF8F4`), não cinza/branco antigo
- [x] Fonte renderizada é Urbanist (DevTools → computed font-family)
- [x] Botão primário em `/login` é verde (`#5A6838`) com texto branco
- [x] Inputs têm cantos arredondados (~8px)
- [x] Títulos usam marrom escuro (`#2E1E12` ou `#6B5843`)

## Conformidade (DESIGN.md T01–T05)

- [x] T01 — Textos usam roles da escala (sem tamanhos arbitrários nos modules tocados)
- [x] T02 — Paddings/margins na escala 8px
- [x] T03 — Texto funcional com contraste ≥ 4.5:1 sobre cream
- [x] T04 — Botões 12px radius; inputs 8px
- [x] T05 — Sem hex fora da paleta nos arquivos alterados

## Gate

```bash
cd client && npm run pre-push:checks
```

- [x] Exit code 0

## Regressão rápida

- [x] Login Google ainda funciona (sem alteração de lógica auth)
- [x] Dashboard/stubs renderizam sem erro de hydration
- [x] Providers (`render-with-providers`) passam em testes existentes
