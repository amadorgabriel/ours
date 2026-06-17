# Change 006 — Client Platform Split (Breaking)

## Why

O produto foi concebido como PWA web-first. A decisão de produto mudou: o **cliente principal** será um app **mobile** (`mobile/`), enquanto o frontend atual vira **`web/`** — PWA opcional focada em **suporte/admin** (gestão de família, convites, dados dos pais).

Server e banco permanecem inalterados neste change. A API REST continua única para todos os clients.

## What

1. **Renomear** `client/` → `web/` (breaking no monorepo)
2. **Criar** `mobile/` como placeholder documentado (sem código de app ainda)
3. **Atualizar** visão em `PROJECT.md`, brownfield em `codebase/`, roadmap e changes ativos
4. **Definir** matriz de responsabilidades web vs mobile em `shared/platforms.md`
5. **Reposicionar** change 004: implementação continua em `web/` como ponte até mobile M0

## Impact

| Área | Detalhe |
|------|---------|
| **Monorepo** | `client/` deixa de existir; paths, scripts e docs apontam para `web/` |
| **Specs** | Todas as referências `client/` → `web/`; novo escopo por plataforma |
| **Server / DB** | Sem alteração |
| **Change 004** | Tasks atualizadas para paths `web/`; escopo funcional inalterado na fase ponte |
| **Change 005** | Arquivado; `DESIGN.md` aplica-se a `web/` agora; mobile herda tokens quando iniciar |
| **Risk** | Médio — rename quebra scripts locais, CI e skill até atualizados |
| **Breaking** | Sim — path do pacote frontend, imports de docs, gates `cd client` |

## Success

- [ ] `web/` substitui `client/` no filesystem e na documentação
- [ ] `mobile/README.md` descreve papel futuro e stack TBD
- [ ] `PROJECT.md` reflete mobile-first + web admin opcional
- [ ] `shared/platforms.md` com matriz de features por plataforma
- [ ] Gates: `cd web && npm run pre-push:checks` + `dotnet test` (server inalterado)

## References

- Context: `.specs/changes/006-client-platform-split/context.md`
- Spec: `.specs/changes/006-client-platform-split/spec.md`
- Design: `.specs/changes/006-client-platform-split/design.md`
- Tasks: `.specs/changes/006-client-platform-split/tasks.md`
- Platforms: `.specs/shared/platforms.md`
