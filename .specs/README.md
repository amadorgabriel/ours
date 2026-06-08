# Specs — Project Ours

Fonte da verdade para desenvolvimento spec-driven (SDD).

## Padrão híbrido

Combina **Open Spec** (changes numerados, constitution, templates) com **TLC Spec-Driven** (project, codebase brownfield, features).

```text
.specs/
├── project/          # PROJECT, ROADMAP, STATE
├── memory/           # constitution (princípios fixos)
├── shared/           # glossário, domínio, API índice
├── codebase/         # STACK, ARCHITECTURE, CONVENTIONS, TESTING, CONCERNS
├── features/         # specs de produto por domínio
├── changes/          # propostas ativas (004-family-management, …)
├── template/         # spec, plan, tasks
└── archive/          # histórico e PRD longo
```

## Fluxo

1. Ler `project/PROJECT.md` + `memory/constitution.md`
2. Trabalho ativo: `changes/NNN-*/tasks.md`
3. Feature nova: `features/<slug>/spec.md` → (design) → tasks → implementar
4. Atualizar `project/STATE.md` ao fechar change

## Change ativo

**[004-family-management](changes/004-family-management/tasks.md)** — M2: criar família, convites, join, seletor multi-família.

Skill client: `.cursor/skills/ours-client-standard/`

## `_docs/` deprecado

Ver `.specs/archive/README.md` para mapa de migração.
