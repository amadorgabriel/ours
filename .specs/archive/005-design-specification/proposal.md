# Change 005 — Design Specification

## Why

O client do Project Ours usa tema Mantine genérico (Geist Sans, `primaryColor: blue`, fundo `#fafafa`) sem tokens visuais alinhados ao produto. Telas novas (M2–M5) e agentes de IA que implementam UI não têm fonte única de verdade para cores, tipografia, espaçamento e padrões de componentes.

A referência visual [Freud.ai (Dribbble)](https://dribbble.com/shots/22022604--SH-freud-ai-Mental-Health-AI-Chatbot-Virtual-Care-Mobile-UI) foi analisada (12 imagens em `references/`) e traduzida em tokens executáveis. O resultado deve servir **todas** as mudanças de UI futuras — humanas ou via agente.

## What

1. **Spec persistente:** `.specs/design/DESIGN.md` — tokens, princípios, testes de conformidade e instruções para agentes
2. **Integração técnica:** mapeamento tokens → Mantine theme + Tailwind `@theme` + componentes `ui/`
3. **Skill update:** referência cruzada em `ours-client-standard` e `CONVENTIONS.md`
4. **Gate de conformidade:** checklist manual + assertions documentadas para revisão de PRs

## Impact

| Área | Detalhe |
|------|---------|
| **Specs** | Novo diretório `.specs/design/`; change 005 como proposta ativa |
| **Client** | `mantine-theme.ts`, `globals.css`, font loading, componentes `ui/` |
| **Processo** | Toda feature UI deve citar `DESIGN.md` + princípios violados em review |
| **Risk** | Médio — retema pode afetar telas existentes (auth, stubs); migração incremental |
| **Breaking** | Visual only; sem breaking de API |

## Out of Scope (este change)

| Item | Motivo |
|------|--------|
| Reescrever todas as telas existentes | Migração incremental por feature |
| Wave Tab Bar completa | Spec definida; implementação quando houver navegação principal mobile |
| Storybook / Chromatic | Sem tooling de visual regression no MVP |
| Figma tokens export | Spec é markdown-first |
| Ilustrações custom Project Ours | Usar placeholders outline até assets próprios |

## Success

- [x] `.specs/design/DESIGN.md` publicado com versão `1.0.0` e IDs de princípios
- [x] `mantine-theme.ts` usa paleta orgânica (brown/green/orange/cream)
- [x] Fonte Urbanist carregada e aplicada globalmente
- [x] Tailwind `@theme` expõe tokens CSS para modules
- [x] `ours-client-standard` referencia `DESIGN.md` como obrigatório em UI
- [x] Gate: `npm run pre-push:checks` passa após retema

## References

- Visual refs: `.specs/changes/005-design-specification/references/`
- Spec: `.specs/changes/005-design-specification/spec.md`
- Context: `.specs/changes/005-design-specification/context.md`
- Architecture: `.specs/changes/005-design-specification/design.md`
- Canonical design: `.specs/design/DESIGN.md`
- Tasks: `.specs/changes/005-design-specification/tasks.md`
