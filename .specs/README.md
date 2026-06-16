# Specs — Project Ours

Fonte da verdade para desenvolvimento spec-driven (SDD).

## Padrão híbrido

Combina **Open Spec** (changes numerados, constitution, templates) com **TLC Spec-Driven** (project, codebase brownfield, features).

```text
.specs/
├── project/          # PROJECT, ROADMAP, STATE
├── memory/           # constitution (princípios fixos)
├── design/           # DESIGN.md — tokens e princípios visuais (obrigatório em UI)
├── shared/           # glossário, domínio, plataformas, API índice
├── codebase/         # STACK, ARCHITECTURE, CONVENTIONS, TESTING, CONCERNS
├── features/         # specs de produto por domínio
├── changes/          # propostas ativas (004, 006, …)
├── template/         # spec, plan, tasks
└── archive/          # histórico (001–005, …)
```

## Fluxo

1. Ler `project/PROJECT.md` + `memory/constitution.md` + `shared/platforms.md`
2. Trabalho ativo: `changes/NNN-*/tasks.md`
3. Feature nova: `features/<slug>/spec.md` → (design) → tasks → implementar
4. Atualizar `project/STATE.md` ao fechar change

## Changes ativos

| Change | Escopo | Tasks |
|--------|--------|-------|
| [006-client-platform-split](changes/006-client-platform-split/tasks.md) | Breaking: `client` → `web`, placeholder `mobile` | Concluído |
| [004-family-management](changes/004-family-management/tasks.md) | M2: família, convites, join | Em progresso |

**Design (obrigatório em UI):** [`.specs/design/DESIGN.md`](design/DESIGN.md) — change 005 arquivado.

**Plataformas:** [`.specs/shared/platforms.md`](shared/platforms.md) — mobile (principal) vs web (admin PWA).

**Rotas web:** URLs diretas (`/`, `/login`, `/dashboard`, …) com next-intl `localePrefix: 'never'` (MVP monolíngue pt-BR). Detalhes em `codebase/ARCHITECTURE.md`.

Skill web: `.cursor/skills/ours-client-standard/` (paths `web/`)

## `_docs/` deprecado

Conteúdo histórico migrado para `.specs/archive/` e feature specs.
