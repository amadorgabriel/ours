# Archive

Documentos históricos ou de referência longa — **não carregar em sessões normais**.

## Migração `_docs` → `.specs` (2026-06-08)

| Antes (`_docs/`) | Depois (`.specs/`) | Ação |
|------------------|-------------------|------|
| `product-requirements-document.md` | `features/*/spec.md` + `shared/domain-model.md` | PRD completo mantido uma vez em `_docs/product-requirements-document.md` até fatiar por feature |
| `_draft/product-requirements-document.md` | — | **Duplicata — pode remover** |
| `_draft/client-standard.md` | `codebase/CONVENTIONS.md` | Consolidado |
| `_draft/frontend-setup-prompt.md` | `codebase/CONVENTIONS.md` + `TESTING.md` | Consolidado |
| `_draft/mvp.md` | — | Prompts de geração; arquivar se não usar |
| `_draft/re-planning.md` | `project/ROADMAP.md` + `STATE.md` | Consolidado |

## PRD completo

Arquivo longo (v1.1): `_docs/product-requirements-document.md`

Use por feature:
- Auth: `.specs/features/auth/spec.md`
- API/ERD: `.specs/shared/domain-model.md` + PRD §5–6 quando necessário

## Changes arquivados

Mover pastas de `.specs/changes/NNN-*` para `.specs/archive/changes/` quando concluídos.
