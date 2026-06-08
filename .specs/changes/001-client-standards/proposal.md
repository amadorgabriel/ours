# Change 001 — Client Standards

## Why

O pacote `client/` foi iniciado com tooling correto, mas a implementação HTTP e a completude dos módulos não seguem o padrão documentado em `CONVENTIONS.md`. Sem enforcement, cada feature nova divergirá da arquitetura clean.

## What

1. Auditar `client/` contra `.specs/codebase/CONVENTIONS.md`
2. Corrigir gaps críticos (HTTP, estrutura de módulos, exports)
3. Adicionar verificações automatizáveis onde possível (ESLint boundaries, scripts de audit)
4. Instalar skill `ours-client-standard` para agentes futuros

## Impact

- **Affected:** `client/src/**`, `client/eslint.config.mjs`, hooks
- **Risk:** Baixo — mudanças estruturais sem alterar UX visível
- **Breaking:** Nenhum para usuário final

## Success

- [ ] `npm run pre-push:checks` passa
- [ ] HTTP client alinhado a cookie + antiforgery + `X-Family-Id`
- [ ] Módulo `auth` com 4 camadas mínimas
- [ ] Skill disponível em `.cursor/skills/ours-client-standard/`
