# Change 006 — Client Platform Split (implementation spec)

**Context:** `.specs/changes/006-client-platform-split/context.md`  
**Platforms:** `.specs/shared/platforms.md`

Breaking change na estrutura do monorepo: `client/` → `web/`, placeholder `mobile/`, server/DB inalterados.

## Escopo do change

| In | Out |
|----|-----|
| Rename `client/` → `web/` | Código do app mobile |
| Placeholder `mobile/README.md` | Stack mobile definida |
| Atualizar specs, docs, skill, change 004 paths | Alterações server/DB |
| `shared/platforms.md` | Migração de features consumer web → mobile |
| Arquivar change 005 | CI/CD produção |

## Requirements

### P1: Estrutura monorepo ⭐ MVP

| ID | Critério |
|----|----------|
| CP-01 | WHEN repositório é clonado THEN SHALL existir `web/`, `mobile/` e `server/` na raiz |
| CP-02 | WHEN path `client/` é referenciado em docs ativos THEN SHALL apontar para `web/` |
| CP-03 | WHEN `mobile/` é listado THEN SHALL conter apenas README placeholder (sem app code) |
| CP-04 | WHEN gates de frontend são documentados THEN SHALL usar `cd web && npm run pre-push:checks` |

### P2: Visão e roadmap ⭐ MVP

| ID | Critério |
|----|----------|
| CP-05 | WHEN `PROJECT.md` é lido THEN SHALL descrever mobile como cliente principal e web como admin PWA opcional |
| CP-06 | WHEN `ROADMAP.md` lista milestones THEN SHALL indicar plataforma alvo (mobile/web) por milestone |
| CP-07 | WHEN `STATE.md` registra decisão THEN SHALL incluir change 006 com data e motivo |

### P3: Brownfield docs ⭐ MVP

| ID | Critério |
|----|----------|
| CP-08 | WHEN `codebase/STACK.md` lista pacotes THEN SHALL usar `web/` e `mobile/` (não `client/`) |
| CP-09 | WHEN `codebase/STRUCTURE.md` e `ARCHITECTURE.md` descrevem frontend THEN SHALL referenciar `web/src/` |
| CP-10 | WHEN `codebase/CONVENTIONS.md` define padrões THEN SHALL aplicar a `web/` (título atualizado) |

### P4: Changes e features

| ID | Critério |
|----|----------|
| CP-11 | WHEN change 004 tasks referenciam paths THEN SHALL usar `web/src/...` |
| CP-12 | WHEN change 005 é concluído THEN SHALL estar em `.specs/archive/005-design-specification/` |
| CP-13 | WHEN feature specs mencionam "client" THEN SHALL usar "web" ou plataforma explícita |

### P5: Skill e tooling

| ID | Critério |
|----|----------|
| CP-14 | WHEN skill `ours-client-standard` é usada THEN SHALL referenciar `web/` (ou skill renomeada) |
| CP-15 | WHEN `web/package.json` existe THEN nome do pacote SHALL refletir `web` (não `client`) |

## Open Questions (resolvidas)

| # | Pergunta | Decisão |
|---|----------|---------|
| Q1 | Fase ponte: web mantém MVP completo ou corta consumer agora? | **MVP completo no web** até mobile M0 (confirmado 2026-06-16) |
| Q2 | Stack de `mobile/`? | Deferir — placeholder apenas |
| Q3 | Auth mobile: cookie ou token? | Deferir — server inalterado neste change |

## Success Criteria

- [ ] Nenhuma referência ativa a `client/` em `.specs/` (exceto archive histórico)
- [ ] `shared/platforms.md` publicado
- [ ] Gates passam em `web/` após rename

## Requirement Traceability

| ID | Task |
|----|------|
| CP-01–04 | T1, T2, T3 |
| CP-05–07 | T4, T5 |
| CP-08–10 | T6 |
| CP-11 | T7 |
| CP-12 | T8 |
| CP-13–15 | T6, T9 |
