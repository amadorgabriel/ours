# Tasks — Change 006 Client Platform Split

**Spec:** `.specs/changes/006-client-platform-split/spec.md`  
**Design:** `.specs/changes/006-client-platform-split/design.md`  
**Gate:** `cd web && npm run pre-push:checks` + `cd server && dotnet test`

## Execution Plan

```
Phase 1 — Spec (esta sessão)
  ✓ proposal, spec, context, design, platforms.md

Phase 2 — Docs (esta sessão)
  T4  PROJECT.md + ROADMAP.md + STATE.md
  T5  README.md raiz + .specs/README.md
  T6  codebase/* + skill

Phase 3 — Monorepo rename
  T1  git mv client/ → web/
  T2  Ajustar package.json, README web, husky paths
  T3  mobile/README.md placeholder

Phase 4 — Changes
  T7  Atualizar paths em 004-family-management
  T8  Arquivar 005 → archive/
  T9  Verificar gates pós-rename
```

---

## Tasks

### T1: Rename `client/` → `web/`

**What:** `git mv client web` na raiz do monorepo.  
**Where:** raiz `project-ours/`  
**Depends on:** T4–T6 (docs podem preceder ou seguir em paralelo)  
**Requirement:** CP-01

**Done when:**

- [ ] Diretório `client/` não existe
- [ ] `web/` contém todo o código frontend anterior

**Tests:** none  
**Gate:** `cd web && npm install && npm run type-check`

---

### T2: Ajustar tooling do pacote `web/`

**What:** Atualizar `package.json` name, `web/README.md`, husky `core.hooksPath`, scripts que referenciam `client/`.  
**Where:** `web/package.json`, `web/README.md`, `.husky/` se aplicável  
**Depends on:** T1  
**Requirement:** CP-04, CP-15

**Done when:**

- [ ] `npm run dev` funciona em `web/`
- [ ] `npm run pre-push:checks` passa
- [ ] Husky hooks disparam a partir de `web/`

**Tests:** `npm run test:run`  
**Gate:** `npm run pre-push:checks`

---

### T3: Placeholder `mobile/`

**What:** Criar `mobile/README.md` com papel futuro, link para `platforms.md`, stack TBD.  
**Where:** `mobile/README.md`  
**Depends on:** None  
**Requirement:** CP-03

**Done when:**

- [ ] README descreve mobile como cliente principal
- [ ] Indica que implementação é change futuro

**Tests:** none  
**Gate:** none

---

### T4: Atualizar project docs

**What:** PROJECT.md (visão mobile-first), ROADMAP.md (plataforma por milestone), STATE.md (decisão 006).  
**Where:** `.specs/project/`  
**Depends on:** None  
**Requirement:** CP-05, CP-06, CP-07

**Done when:**

- [ ] Vision não descreve PWA como produto principal
- [ ] Roadmap referencia `web/` e `mobile/` onde aplicável
- [ ] STATE registra breaking change 2026-06-16

**Tests:** none  
**Gate:** review manual

---

### T5: Atualizar READMEs índice

**What:** README raiz e `.specs/README.md` — paths, changes ativos, gate commands.  
**Where:** `README.md`, `.specs/README.md`  
**Depends on:** T4  
**Requirement:** CP-02

**Done when:**

- [ ] Sem referência a `client/` como path ativo
- [ ] Change 006 listado em changes ativos
- [ ] Change 005 removido de ativos (ou marcado arquivado)

**Tests:** none  
**Gate:** none

---

### T6: Atualizar brownfield + skill

**What:** STACK, STRUCTURE, ARCHITECTURE, CONVENTIONS, CONCERNS; skill `ours-client-standard`.  
**Where:** `.specs/codebase/`, `.cursor/skills/ours-client-standard/`  
**Depends on:** T4  
**Requirement:** CP-08, CP-09, CP-10, CP-14

**Done when:**

- [ ] Todos os paths frontend usam `web/`
- [ ] CONVENTIONS título reflete "Web (ec-v3-ui aligned)"

**Tests:** none  
**Gate:** none

---

### T7: Atualizar change 004 paths

**What:** Substituir `client/` por `web/` em tasks, design, proposal de 004.  
**Where:** `.specs/changes/004-family-management/`  
**Depends on:** T1  
**Requirement:** CP-11

**Done when:**

- [ ] Nenhum path `client/src/` em tasks 004

**Tests:** none  
**Gate:** none

---

### T8: Arquivar change 005

**What:** Mover `.specs/changes/005-design-specification/` → `.specs/archive/005-design-specification/`.  
**Where:** `.specs/changes/`, `.specs/archive/`  
**Depends on:** None  
**Requirement:** CP-12

**Done when:**

- [ ] `changes/` contém apenas 004 e 006 ativos
- [ ] DESIGN.md permanece em `.specs/design/DESIGN.md`

**Tests:** none  
**Gate:** none

---

### T9: Verificação final

**What:** Grep por `client/` em docs ativos; rodar gates.  
**Where:** repo inteiro  
**Depends on:** T1–T8  
**Requirement:** CP-01–CP-15

**Done when:**

- [ ] `cd web && npm run pre-push:checks` ✅
- [ ] `cd server && dotnet test` ✅
- [ ] Referências `client/` só em archive histórico

**Tests:** full gates  
**Gate:** pre-push + dotnet test

---

## Status

| Task | Status |
|------|--------|
| T4 | ✅ Docs project (esta sessão) |
| T5 | ✅ READMEs índice |
| T6 | ✅ Brownfield + skill |
| T3 | ✅ mobile/README.md |
| T8 | ✅ Arquivar 005 |
| T1 | ✅ Rename `client/` → `web/` |
| T2 | ✅ Tooling + gates |
| T7 | ✅ Paths 004 atualizados |
| T9 | ✅ Verificação final |
