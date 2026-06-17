# Change 005 — Design Specification (implementation spec)

**Canonical design:** `.specs/design/DESIGN.md`  
**Context:** `.specs/changes/005-design-specification/context.md`

Este documento define requisitos rastreáveis para estabelecer e integrar o design system do Project Ours.

## Escopo do change

| In | Out |
|----|-----|
| DESIGN.md persistente com tokens e princípios | Retema completo de todas as telas |
| Mantine theme + Tailwind tokens | Storybook |
| Font Urbanist global | Assets de ilustração custom |
| Atualização de skills/docs | Wave Tab Bar implementada (spec only) |
| Checklist de conformidade | Visual regression CI |

## Requirements

### P1: Design tokens documentados ⭐ MVP

| ID | Critério |
|----|----------|
| DS-01 | WHEN agente ou dev inicia trabalho de UI THEN SHALL ler `.specs/design/DESIGN.md` como única fonte de tokens visuais |
| DS-02 | WHEN DESIGN.md é consultado THEN SHALL expor cores, tipografia, espaçamento, bordas, sombras, grid e motion com valores hex/px explícitos |
| DS-03 | WHEN princípio P01–P07 é aplicado THEN SHALL existir regra executável, constraint e exemplo válido/inválido em DESIGN.md |

### P2: Integração no client ⭐ MVP

| ID | Critério |
|----|----------|
| DS-04 | WHEN app renderiza THEN font-family global SHALL ser Urbanist com fallbacks definidos em DESIGN.md |
| DS-05 | WHEN `mantine-theme.ts` é carregado THEN `primaryColor` e paleta custom SHALL mapear `serenity_green_60`, `mindful_brown_100`, `empathy_orange_50` |
| DS-06 | WHEN `globals.css` define `@theme` THEN variáveis CSS SHALL espelhar tokens de cor e fonte de DESIGN.md |
| DS-07 | WHEN body renderiza THEN background SHALL ser `bg_cream` (#FCF8F4) e texto primário `text_dark_brown` (#2E1E12) |

### P3: Componentes base alinhados

| ID | Critério |
|----|----------|
| DS-08 | WHEN `ui/DataDisplay/Button` renderiza variante primária THEN fundo SHALL ser `serenity_green_60` e radius 12px |
| DS-09 | WHEN `ui/DataEntry/TextInput` renderiza THEN radius SHALL ser 8px e padding interno múltiplo de 8px |
| DS-10 | WHEN card ou modal em `ui/` usa radius THEN SHALL ser 16px com shadow medium |
| DS-11 | WHEN badge ou pill renderiza THEN radius SHALL ser 999px |

### P4: Processo e rastreabilidade

| ID | Critério |
|----|----------|
| DS-12 | WHEN change de UI é proposto em `.specs/changes/` THEN spec ou tasks SHALL referenciar DESIGN.md |
| DS-13 | WHEN `ours-client-standard` skill é usada THEN SHALL incluir link obrigatório para DESIGN.md |
| DS-14 | WHEN PR de UI é revisado THEN reviewer SHALL verificar conformidade com testes T01–T06 de DESIGN.md |

### P5: Acessibilidade

| ID | Critério |
|----|----------|
| DS-15 | WHEN texto funcional sobre `bg_cream` THEN contraste SHALL ser ≥ 4.5:1 (WCAG AA) |
| DS-16 | WHEN texto sobre `bg_dark_green` ou botão primário THEN cor SHALL ser `text_light` (#FFFFFF) |

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| DS-01 | P1 | Complete |
| DS-02 | P1 | Complete |
| DS-03 | P1 | Complete |
| DS-04 | P2 | Complete |
| DS-05 | P2 | Complete |
| DS-06 | P2 | Complete |
| DS-07 | P2 | Complete |
| DS-08 | P3 | Complete |
| DS-09 | P3 | Complete |
| DS-10 | P3 | Complete |
| DS-11 | P3 | Complete |
| DS-12 | P4 | Complete |
| DS-13 | P4 | Complete |
| DS-14 | P4 | Complete |
| DS-15 | P5 | Complete |
| DS-16 | P5 | Complete |

## Success Criteria

- [x] DESIGN.md v1.0.0 em `.specs/design/`
- [x] Zero hex hardcoded em modules existentes tocados por este change
- [x] `npm run pre-push:checks` verde
- [x] Login e dashboard exibem paleta cream/green/brown (smoke visual)
