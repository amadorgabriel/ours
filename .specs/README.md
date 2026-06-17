# Specs — Project Ours

Fonte da verdade para desenvolvimento spec-driven (SDD).

## Estrutura (3 frentes)

```text
.specs/
├── project/              # PROJECT, ROADMAP, STATE
├── memory/               # constitution (princípios fixos — manter)
├── shared/               # domínio, API, glossário, plataformas, concerns
├── platforms/            # brownfield por frente
│   ├── mobile/           # STACK, ARCHITECTURE, CONVENTIONS, STRUCTURE, TESTING
│   ├── web/
│   └── server/
├── design/
│   ├── DESIGN.md         # tokens compartilhados + web admin §6
│   └── mobile.md         # layouts e navegação mobile
├── features/             # specs de produto + notas por plataforma
│   └── <slug>/
│       ├── spec.md       # requisitos (plataforma-agnóstico)
│       ├── web.md        # status/implementação web
│       └── mobile.md     # spec para replicação mobile
├── template/             # spec, plan, tasks
└── archive/              # histórico de changes concluídos
```

## Memory vs State

| Pasta | Conteúdo | Quando atualizar |
|-------|----------|------------------|
| `memory/constitution.md` | Princípios não negociáveis, objetivo, fora de escopo | Raramente — mudanças de produto fundamentais |
| `project/STATE.md` | Decisões, bloqueios, lições, todos | A cada sessão de trabalho |

**Avaliação:** `memory/` é necessário e deve ser mantido — separa princípios fixos da memória evolutiva.

## Fluxo

1. Ler `project/PROJECT.md` + `memory/constitution.md` + `shared/platforms.md`
2. Escolher frente: `platforms/{mobile,web,server}/`
3. Feature: `features/<slug>/spec.md` → `web.md` ou `mobile.md` conforme plataforma
4. Design UI: `design/DESIGN.md` (tokens) + `design/mobile.md` ou §6 web
5. Atualizar `project/STATE.md` ao fechar trabalho

## Features ativas

| Feature | Produto | Web | Mobile |
|---------|---------|-----|--------|
| Auth | [spec.md](features/auth/spec.md) | [web.md](features/auth/web.md) ✅ | [mobile.md](features/auth/mobile.md) |
| Family | [spec.md](features/family/spec.md) | [web.md](features/family/web.md) | [mobile.md](features/family/mobile.md) |

## Gates

| Frente | Comando |
|--------|---------|
| Web | `cd web && npm run pre-push:checks` |
| Mobile | `cd mobile && npm run test` (M6+) |
| Server | `cd server && dotnet test` |

Skill web: `.cursor/skills/ours-client-standard/` (paths `web/`)
