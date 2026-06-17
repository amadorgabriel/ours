# Tasks — Change 005 Design Specification

**Spec:** `.specs/changes/005-design-specification/spec.md`  
**Design:** `.specs/changes/005-design-specification/design.md`  
**Canonical:** `.specs/design/DESIGN.md`  
**Gate:** `cd client && npm run pre-push:checks`

## Execution Plan

```
Phase 1 — Spec (concluída no plan)
  ✓ DESIGN.md publicado
  ✓ proposal, spec, context, design

Phase 2 — Token foundation
  T1 [P]  design-tokens.ts
  T2      mantine-theme.ts retema
  T3      globals.css + Tailwind @theme

Phase 3 — Typography
  T4      Urbanist via next/font em layout.tsx

Phase 4 — UI wrappers
  T5 [P]  Button defaultProps
  T6 [P]  TextInput defaultProps
  T7      Title + Text roles (opcional se Mantine Text cobre)

Phase 5 — Process integration
  T8 [P]  ours-client-standard SKILL.md
  T9 [P]  CONVENTIONS.md + README.md
  T10     Smoke visual checklist

Phase 6 — Deferred
  T11     WaveTabBar (M3+)
```

## Granularity Check

| Task | Atomic? | One deliverable |
|------|---------|-----------------|
| T1–T10 | ✅ | Um arquivo/conceito por task |

## Diagram-Definition Cross-Check

| Task | Depends on | In diagram |
|------|------------|------------|
| T1 | — | design-tokens |
| T2 | T1 | mantine-theme |
| T3 | T1 | globals.css |
| T4 | — | font loader |
| T5 | T2 | Button |
| T6 | T2 | TextInput |
| T7 | T2, T4 | Title/Text |
| T8 | DESIGN.md | skill |
| T9 | DESIGN.md | docs |
| T10 | T2–T7 | smoke |

---

## Tasks

### T1: `design-tokens.ts` [P]

**What:** Constantes TypeScript espelhando DESIGN.md (cores, radius, spacing).  
**Where:** `client/src/presentation/styles/design-tokens.ts`  
**Depends on:** None  
**Requirement:** DS-02

**Done when:**

- [ ] Export `designTokens` com todos os hex de DESIGN.md seção 1
- [ ] Comentário linkando `.specs/design/DESIGN.md`

**Tests:** none  
**Gate:** quick (`npm run type-check`)

---

### T2: Retema Mantine

**What:** `createTheme` com paleta orgânica, `primaryColor: 'green'`, radius defaults.  
**Where:** `client/src/presentation/styles/mantine-theme.ts`  
**Depends on:** T1  
**Reuses:** `createTheme` existente  
**Requirement:** DS-05, DS-07

**Done when:**

- [ ] `primaryColor` = green (shade 6 = `#5A6838`)
- [ ] Arrays `brown`, `green`, `orange`, `darkGreen` derivados dos tokens
- [ ] `defaultRadius` alinhado (md = 12px)
- [ ] `fontFamily` aponta para `var(--font-urbanist)`
- [ ] `other` ou vars para `bgCream`, `textDarkBrown`

**Tests:** none  
**Gate:** quick

---

### T3: CSS variables + Tailwind

**What:** `:root` vars e `@theme inline` com tokens.  
**Where:** `client/src/presentation/styles/globals.css`  
**Depends on:** T1  
**Requirement:** DS-06, DS-07

**Done when:**

- [ ] `--color-bg-cream`, `--color-text-primary`, cores primárias definidas
- [ ] `body` usa cream + text_dark_brown
- [ ] `@theme inline` expõe `--color-background`, `--color-primary`, `--font-sans`
- [ ] Remover refs Geist

**Tests:** none  
**Gate:** quick

---

### T4: Font Urbanist

**What:** Carregar Urbanist (400–800) via `next/font/google`.  
**Where:** `client/src/app/[locale]/layout.tsx`  
**Depends on:** None  
**Requirement:** DS-04

**Done when:**

- [ ] `--font-urbanist` no `<html>`
- [ ] `themeColor` meta → `#5A6838`
- [ ] Geist removido do layout

**Tests:** none  
**Gate:** quick

---

### T5: Button wrapper [P]

**What:** `defaultProps` com radius 12px; variantes alinhadas P03/P05.  
**Where:** `client/src/ui/DataDisplay/Button/index.tsx`  
**Depends on:** T2  
**Requirement:** DS-08

**Done when:**

- [ ] Export Mantine Button com theme override ou wrapper `styles`
- [ ] Primary usa green shade 6
- [ ] Sem hex em modules — só via theme

**Tests:** optional component snapshot  
**Gate:** `npm run test`

---

### T6: TextInput wrapper [P]

**What:** radius 8px, padding na escala.  
**Where:** `client/src/ui/DataEntry/TextInput/index.tsx`  
**Depends on:** T2  
**Requirement:** DS-09

**Done when:**

- [ ] `radius` = sm (8px) via theme component override
- [ ] Padding interno 16px

**Tests:** none  
**Gate:** quick

---

### T7: Title + Text typography roles (opcional)

**What:** Garantir headings usam pesos da escala via theme `headings`.  
**Where:** `client/src/ui/DataDisplay/Title/index.tsx`, `Text/index.tsx`  
**Depends on:** T2, T4  
**Requirement:** DS-02, DS-03

**Done when:**

- [ ] `headings` fontWeight 600/700 conforme nível
- [ ] Ou documentar que modules usam props `size` mapeadas aos roles

**Tests:** none  
**Gate:** quick

---

### T8: Atualizar skill `ours-client-standard` [P]

**What:** Seção obrigatória referenciando DESIGN.md.  
**Where:** `.cursor/skills/ours-client-standard/SKILL.md`  
**Depends on:** DESIGN.md  
**Requirement:** DS-13

**Done when:**

- [ ] Link `.specs/design/DESIGN.md` na seção UI
- [ ] Regra: zero hex em modules

**Tests:** none  
**Gate:** n/a (docs)

---

### T9: Atualizar CONVENTIONS + README [P]

**What:** Documentar design system no brownfield map.  
**Where:** `.specs/codebase/CONVENTIONS.md`, `.specs/README.md`  
**Depends on:** DESIGN.md  
**Requirement:** DS-12

**Done when:**

- [ ] CONVENTIONS menciona `.specs/design/DESIGN.md`
- [ ] README lista change 005 como ativo (ou próximo)

**Tests:** none  
**Gate:** n/a

---

### T10: Smoke visual

**What:** Checklist manual pós-retema.  
**Where:** `.specs/changes/005-design-specification/SMOKE.md`  
**Depends on:** T2–T7  
**Requirement:** DS-14, DS-15, DS-16

**Done when:**

- [ ] `/login` exibe fundo cream, botão verde
- [ ] Texto legível (contraste ok)
- [ ] `npm run pre-push:checks` verde
- [ ] Checklist T01–T05 marcada

**Tests:** gate full  
**Gate:** `npm run pre-push:checks`

---

### T11: WaveTabBar (deferred — M3+)

**What:** Componente navegação onda conforme P06.  
**Where:** `client/src/ui/Navigation/WaveTabBar/`  
**Depends on:** M3 navigation spec  
**Requirement:** DS-03 (P06 spec only)

**Status:** Deferred  
**Gate:** —

---

## Status Summary

| Task | Status |
|------|--------|
| T1–T10 | Complete |
| T11 | Deferred |
| Spec artifacts | Complete |
