# Tasks — Change 002: Cleanup Theme & Folders

**Depends on:** Change 001 concluído (estrutura ec-v3-ui ativa)  
**Gate global:** `npm run pre-push:checks` (client) + `dotnet build` (server)

---

## Execution Plan

```
T1 [P] ─┐
T2 [P] ─┼→ T3 → T4 → T5 → T6 → T7 → T8 → T9
        │
T10 ────┘ (após T1–T8)
```

`[P]` = pode rodar em paralelo (sem dependência entre si)

---

## T1 — Remover pastas órfãs vazias `[P]`

**What:** Deletar diretórios vazios do layout antigo.

**Where:**
- `client/src/modules/` (árvore completa)
- `client/src/stores/`
- `client/src/core/application/`
- `client/src/core/infrastructure/`
- `client/src/core/presentation/`

**Depends on:** —

**Reuses:** Inventário em `spec.md` (CLN-01)

**Done when:**
- [ ] Pastas não existem mais no filesystem
- [ ] `npm run type-check` ainda passa (nenhum import quebrado)

**Tests:** Gate — `npm run type-check`

**Maps to:** CLN-01

---

## T2 — Remover rota e módulo dev-theme `[P]`

**What:** Eliminar playground de tema.

**Where:**
- DELETE `client/src/app/[locale]/dev/` (árvore)
- DELETE `client/src/presentation/modules/dev-theme/`

**Depends on:** —

**Done when:**
- [ ] Rota `/dev/theme` ausente do App Router
- [ ] Nenhum import de `@/presentation/modules/dev-theme`

**Tests:** Gate — `npm run type-check`

**Maps to:** CLN-02

---

## T3 — Remover bootstrap de color scheme

**What:** Eliminar script bloqueante e componente de bootstrap.

**Where:**
- DELETE `client/src/presentation/providers/mantine/MantineColorSchemeBootstrap.tsx`
- DELETE `client/src/presentation/styles/mantine-color-scheme-bootstrap.ts`
- DELETE `client/public/mantine-color-scheme-bootstrap.js`
- EDIT `client/src/app/[locale]/layout.tsx` — remover import e `<MantineColorSchemeBootstrap />`
- EDIT `client/src/app/not-found.tsx` — remover import e componente

**Depends on:** T2

**Done when:**
- [ ] Nenhuma referência a `MantineColorSchemeBootstrap` ou `mantine-color-scheme-bootstrap`
- [ ] Layout e not-found compilam

**Tests:** Gate — `npm run type-check`

**Maps to:** CLN-03

---

## T4 — Fixar Mantine light e simplificar CSS

**What:** Esquema visual fixo; remover bridge dark Tailwind↔Mantine.

**Where:**
- EDIT `client/src/presentation/providers/mantine/index.tsx` — `defaultColorScheme="light"` (remover `auto`)
- EDIT `client/src/presentation/styles/mantine-theme.ts` — simplificar `primaryShade` (só light)
- EDIT `client/src/presentation/styles/globals.css` — remover `@custom-variant dark`, bloco `:root[data-mantine-color-scheme='dark']`, comentário sobre Mantine scheme

**Depends on:** T3

**Done when:**
- [ ] `globals.css` sem referência a `data-mantine-color-scheme`
- [ ] MantineProvider não usa `auto`

**Tests:** Gate — `npm run type-check`

**Maps to:** CLN-04

---

## T5 — Remover classes Tailwind `dark:` das páginas

**What:** Estilos light-only nas páginas que usavam `dark:`.

**Where:**
- EDIT `client/src/app/[locale]/page.tsx`
- EDIT `client/src/app/not-found.tsx`
- EDIT `client/src/app/[locale]/not-found.tsx` (se aplicável)

**Depends on:** T4

**Done when:**
- [ ] `grep "dark:" client/src` → 0 matches

**Tests:** Gate — `npm run lint`

**Maps to:** CLN-05

---

## T6 — Remover hooks e UI órfãos

**What:** Deletar código usado exclusivamente pelo tema ou nunca importado.

**Where:**
- DELETE `client/src/presentation/hooks/useIsClient/`
- DELETE `client/src/ui/DataEntry/SegmentedControl/`
- DELETE `client/src/ui/DataDisplay/Skeleton/`
- DELETE `client/src/ui/Feedback/Loader/` (e pasta `Feedback/` se vazia)
- EDIT `client/src/ui/index.ts` — remover exports dos componentes deletados

**Depends on:** T2

**Done when:**
- [ ] `ui/index.ts` exporta apenas: Button, Text, Title, Icon, Container, Stack
- [ ] `tsc --noEmit` passa

**Tests:** Gate — `npm run type-check`

**Maps to:** CLN-06

---

## T7 — Limpar i18n

**What:** Remover namespace `devTheme`.

**Where:**
- EDIT `client/src/i18n/messages/pt-BR.json`

**Depends on:** T2

**Done when:**
- [ ] Chave `devTheme` ausente do JSON
- [ ] JSON válido

**Tests:** Gate — `npm run type-check` (se tipos derivam de messages) ou build

**Maps to:** CLN-07

---

## T8 — Atualizar documentação `[P]` (pode iniciar após T1)

**What:** Alinhar docs à estrutura real.

**Where:**
- EDIT `.specs/codebase/STRUCTURE.md` — remover `dev-theme`, confirmar árvore
- EDIT `client/README.md` — `presentation/modules` em vez de `src/modules/*`; remover Zustand da descrição se ainda citado
- EDIT `.specs/changes/001-client-standards/audit.md` — nota de que pastas foram fisicamente removidas no 002 (opcional, 1 linha)

**Depends on:** T1 (estrutura final conhecida); idealmente após T6 para lista de `ui/`

**Done when:**
- [ ] STRUCTURE.md e README sem referências obsoletas

**Tests:** Revisão manual

**Maps to:** CLN-08

---

## T9 — Gate client completo

**What:** Validar que não há erros de compilação nem regressão de testes.

**Depends on:** T1–T7

**Done when:**
- [ ] `npm run lint` — ok
- [ ] `npm run type-check` — ok
- [ ] `npm run test:run` — 10/10 (ou contagem atual)
- [ ] `npm run build` — ok

**Tests:** `npm run pre-push:checks`

**Maps to:** CLN-09

---

## T10 — Gate server build

**What:** Confirmar server intacto (change é client-only, mas requisito explícito do usuário).

**Depends on:** — (paralelo ao client; rodar ao final)

**Done when:**
- [ ] `dotnet build` em `server/` — 0 erros

**Tests:** `dotnet build`

**Maps to:** CLN-10

---

## Verificação final (checklist UAT)

| Verificação | Comando / ação |
|-------------|----------------|
| Pastas órfãs | `Get-ChildItem client/src/modules, stores, core/application, core/infrastructure, core/presentation` → erro ou vazio |
| Sem tema dev | `rg "dev-theme\|MantineColorScheme\|mantine-color-scheme" client/` → 0 em src |
| Sem dark: | `rg "dark:" client/src` → 0 |
| App sobe | `npm run dev` → home renderiza light |
| CI local | `npm run pre-push:checks` |
