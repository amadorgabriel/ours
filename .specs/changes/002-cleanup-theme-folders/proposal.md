# Change 002 — Cleanup: pastas órfãs e remoção de tema

## Why

Após o change 001 (client standards), restaram **diretórios vazios** da estrutura antiga (`src/modules/`, `src/stores/`, `core/infrastructure/`, etc.) que confundem agentes e devs. Em paralelo, a rota dev `/dev/theme` e o bootstrap de color scheme Mantine introduzem complexidade (localStorage, script bloqueante, variantes Tailwind `dark:`) sem valor para o MVP — o produto não precisa de alternância claro/escuro.

## What

1. Remover pastas órfãs (vazias, sem arquivos) do layout antigo
2. Remover funcionalidade de tema (dark/light/auto, playground dev, bootstrap)
3. Simplificar Mantine para esquema **light fixo**; manter `createTheme` apenas como tokens de design
4. Remover componentes UI e hooks usados exclusivamente pelo playground de tema
5. Atualizar docs de codebase e README
6. Validar gates de compilação (client + server)

## Impact

- **Affected:** `client/src/**`, `client/public/**`, `client/README.md`, `.specs/codebase/STRUCTURE.md`
- **Risk:** Baixo — nenhuma feature de produto depende de dark mode
- **Breaking:** Rota `/dev/theme` deixa de existir; preferência `mantine-color-scheme-value` em localStorage deixa de ser lida

## Success

- [x] Zero diretórios órfãos listados no inventário da spec
- [x] `npm run pre-push:checks` passa (lint, type-check, build, test:run)
- [x] `dotnet build` no server passa sem erros
- [x] Nenhuma referência a `dev-theme`, `MantineColorSchemeBootstrap` ou `mantine-color-scheme-bootstrap`
