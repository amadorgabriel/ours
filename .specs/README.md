# Specs — Project Ours

Fonte da verdade para desenvolvimento spec-driven (SDD).

## Padrão híbrido

Combina **Open Spec** (changes numerados, constitution, templates) com **TLC Spec-Driven** (project, codebase brownfield, features).

```text
.specs/
├── project/          # PROJECT, ROADMAP, STATE
├── memory/           # constitution (princípios fixos)
├── design/           # DESIGN.md — tokens e princípios visuais (obrigatório em UI)
├── shared/           # glossário, domínio, API índice
├── codebase/         # STACK, ARCHITECTURE, CONVENTIONS, TESTING, CONCERNS
├── features/         # specs de produto por domínio
├── changes/          # propostas ativas (004, 005, …)
├── template/         # spec, plan, tasks
└── archive/          # histórico e PRD longo
```

## Fluxo

1. Ler `project/PROJECT.md` + `memory/constitution.md`
2. Trabalho ativo: `changes/NNN-*/tasks.md`
3. Feature nova: `features/<slug>/spec.md` → (design) → tasks → implementar
4. Atualizar `project/STATE.md` ao fechar change

## Changes ativos

| Change | Escopo | Tasks |
|--------|--------|-------|
| [004-family-management](changes/004-family-management/tasks.md) | M2: família, convites, join | Em progresso |
| [005-design-specification](changes/005-design-specification/tasks.md) | Design system + retema client | Complete |

**Design (obrigatório em UI):** [`.specs/design/DESIGN.md`](design/DESIGN.md)

Skill client: `.cursor/skills/ours-client-standard/`

## `_docs/` deprecado

Ver `.specs/archive/README.md` para mapa de migração.
