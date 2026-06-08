# Cleanup Theme & Folders — Specification

## Problem Statement

O repositório carrega duas fontes de confusão: (1) pastas vazias da arquitetura anterior que o audit 001 declarou removidas mas ainda existem no filesystem; (2) infraestrutura de alternância de tema (claro/escuro/auto) usada só em rota de desenvolvimento, com script de bootstrap, CSS `dark:` e componentes UI dedicados — complexidade desnecessária para o MVP.

## Goals

- [ ] Filesystem do `client/src` reflete apenas a estrutura canônica de `CONVENTIONS.md`
- [ ] App roda em esquema visual light fixo, sem toggle nem localStorage de color scheme
- [ ] Client e server compilam e passam testes existentes

## Out of Scope

| Item | Motivo |
|------|--------|
| Redesign visual / nova paleta | Escopo é remoção, não rebranding |
| Remover Mantine ou Tailwind | Stack permanece; só sai alternância de tema |
| Remover `mantine-theme.ts` (`createTheme`) | Tokens de design Mantine (primaryColor) permanecem |
| Remover `theme_color` do `manifest.json` / `viewport.themeColor` | Metadado PWA, não dark mode |
| Playwright E2E | Não existe ainda |
| Limpar `node_modules/` ou `.next/` | Artefatos de build, não código-fonte |

---

## Inventário — Pastas órfãs (vazias, sem arquivos)

Confirmado em 2026-06-08: existem como diretórios mas **não contêm arquivos** e **não são importadas** no código ativo.

| Pasta | Origem |
|-------|--------|
| `client/src/modules/` (+ subpastas: activities, auth, dev-theme, family, goals, home) | Layout pré-001 |
| `client/src/stores/` | Zustand substituído por Context |
| `client/src/core/application/` | Camada antiga |
| `client/src/core/infrastructure/` (+ `http/`) | Substituída por `core/infra/` |
| `client/src/core/presentation/` (+ `providers/`, `theme/`) | Substituída por `presentation/` |

---

## Inventário — Funcionalidade de tema a remover

| Artefato | Papel |
|----------|-------|
| `app/[locale]/dev/theme/page.tsx` | Rota playground |
| `presentation/modules/dev-theme/` | UI de toggle claro/escuro/auto |
| `presentation/providers/mantine/MantineColorSchemeBootstrap.tsx` | Injeta script bloqueante |
| `presentation/styles/mantine-color-scheme-bootstrap.ts` | Constante localStorage |
| `public/mantine-color-scheme-bootstrap.js` | Script que seta `data-mantine-color-scheme` |
| `presentation/hooks/useIsClient/` | Usado só por dev-theme |
| `ui/DataEntry/SegmentedControl/` | Usado só por dev-theme |
| `ui/DataDisplay/Skeleton/` | Usado só por dev-theme |
| `ui/Feedback/Loader/` | Exportado mas nunca importado em app |
| `i18n/messages/pt-BR.json` → namespace `devTheme` | Strings do playground |
| Classes Tailwind `dark:*` em pages/not-found | Dependem do color scheme Mantine |
| `globals.css` → `@custom-variant dark` e vars dark | Bridge Tailwind ↔ Mantine scheme |

### Manter (não é "theme switching")

- `presentation/styles/mantine-theme.ts` — `createTheme({ primaryColor, ... })` com esquema fixo light
- `presentation/providers/mantine/index.tsx` — `MantineProvider` com `defaultColorScheme="light"` (sem `auto`)
- `presentation/styles/globals.css` — vars `:root` light; remover apenas bridge dark

---

## User Stories

### P1: Remover pastas órfãs ⭐ MVP

**User Story**: Como mantenedor do repo, quero que só existam pastas com código ou propósito documentado, para que agentes e devs não sigam caminhos obsoletos.

**Acceptance Criteria**:

1. WHEN listar `client/src` THEN SHALL NOT existir `modules/`, `stores/`, `core/application/`, `core/infrastructure/`, `core/presentation/`
2. WHEN buscar imports de `@/modules/*`, `@/stores/*`, `@/core/presentation/*`, `@/core/infrastructure/*` THEN SHALL encontrar zero ocorrências em código (ESLint `no-restricted-imports` pode permanecer como guarda)

**Independent Test**: `Get-ChildItem` nas pastas listadas retorna vazio ou pasta inexistente.

---

### P1: Remover alternância de tema ⭐ MVP

**User Story**: Como usuário do MVP, quero uma interface light consistente, sem opção de tema nem rota de dev, para reduzir complexidade e FOUC/hidratação.

**Acceptance Criteria**:

1. WHEN acessar `/dev/theme` ou `/pt-BR/dev/theme` THEN SHALL retornar 404
2. WHEN carregar qualquer página THEN SHALL NOT injetar `mantine-color-scheme-bootstrap.js` nem setar `data-mantine-color-scheme` via script
3. WHEN `MantineProvider` montar THEN SHALL usar esquema `light` fixo (sem `auto`, sem toggle)
4. WHEN inspecionar HTML THEN SHALL NOT existir localStorage key `mantine-color-scheme-value` sendo escrita pela app
5. WHEN renderizar home e not-found THEN SHALL NOT usar classes Tailwind `dark:`

**Independent Test**: Build + navegação à home; grep no bundle/fontes confirma ausência dos artefatos listados.

---

### P1: Remover código morto derivado do tema ⭐ MVP

**User Story**: Como mantenedor, quero que componentes e hooks não usados sejam removidos junto com o tema, para não acumular wrappers órfãos em `ui/`.

**Acceptance Criteria**:

1. WHEN buscar `useIsClient`, `SegmentedControl`, `Skeleton`, `Loader` em `client/src` THEN SHALL NOT existir imports fora de `ui/index.ts` (ou o próprio export barrel é atualizado)
2. WHEN abrir `ui/index.ts` THEN SHALL exportar apenas componentes ainda referenciados pela app

**Independent Test**: `tsc --noEmit` + grep de imports.

---

### P2: Atualizar documentação

**User Story**: Como agente ou dev novo, quero que STRUCTURE.md, CONVENTIONS.md e README reflitam a estrutura real pós-limpeza.

**Acceptance Criteria**:

1. WHEN ler `STRUCTURE.md` THEN SHALL NOT mencionar `dev-theme` nem pastas removidas
2. WHEN ler `client/README.md` THEN SHALL descrever `presentation/modules` (não `src/modules/*`)

---

### P2: Gates de compilação

**User Story**: Como CI/mantenedor, quero garantia de zero erros após a limpeza.

**Acceptance Criteria**:

1. WHEN executar `npm run pre-push:checks` em `client/` THEN SHALL passar (lint, type-check, build, test:run)
2. WHEN executar `dotnet build` em `server/` THEN SHALL compilar com 0 erros

**Independent Test**: Comandos acima em ambiente local.

---

## Edge Cases

- WHEN usuário tinha `mantine-color-scheme-value=dark` no localStorage THEN app SHALL ignorar e renderizar light (sem migração)
- WHEN `app/not-found.tsx` (global) renderizar THEN SHALL funcionar sem `MantineColorSchemeBootstrap` nem providers que dependiam dele
- WHEN ESLint `no-restricted-imports` listar paths antigos THEN regra SHALL permanecer válida mesmo após remoção das pastas (defesa em profundidade)

---

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| CLN-01 | P1: Remover pastas órfãs | Verified |
| CLN-02 | P1: Remover rota e módulo dev-theme | Verified |
| CLN-03 | P1: Remover bootstrap color scheme | Verified |
| CLN-04 | P1: Fixar Mantine light + simplificar CSS | Verified |
| CLN-05 | P1: Remover `dark:` Tailwind das páginas | Verified |
| CLN-06 | P1: Remover hooks/UI órfãos | Verified |
| CLN-07 | P1: Remover i18n `devTheme` | Verified |
| CLN-08 | P2: Atualizar docs | Verified |
| CLN-09 | P2: Gates client | Verified |
| CLN-10 | P2: Gate server build | Verified |

**Coverage:** 10 total, 10 verified

---

## Success Criteria

- [ ] Inventário de pastas órfãs: 0 restantes
- [ ] `grep -r "dev-theme\|MantineColorSchemeBootstrap\|mantine-color-scheme" client/src` → 0 matches
- [ ] `npm run pre-push:checks` verde
- [ ] `dotnet build` verde
