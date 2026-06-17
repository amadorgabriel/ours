# Context — Change 006 Client Platform Split

Decisões capturadas na sessão de planejamento (2026-06-16).

## Decisão de produto

| Decisão | Valor |
|---------|-------|
| Cliente principal | `mobile/` (app nativo/híbrido — **não desenvolvido neste change**) |
| Cliente atual | Renomear para `web/` — PWA opcional, foco **admin/suporte** |
| Server + PostgreSQL | **Intocados** — API REST única |
| Breaking change | Sim — estrutura do monorepo e documentação |

## Papel de cada pacote

### `mobile/` (futuro — principal)

- Experiência diária dos irmãos: feed, registrar ligações, metas, estatísticas pessoais
- Onboarding e uso cotidiano
- Stack: **TBD** (placeholder até change dedicado)
- Design: herdará tokens de `.specs/design/DESIGN.md`

### `web/` (atual `client/` — admin PWA opcional)

- Gestão de família (criar, convites, join, seletor multi-família)
- Edição de dados dos pais (Admin)
- Configurações e tarefas administrativas
- Fallback desktop até mobile existir
- Stack: Next.js 16 PWA (mantém stack atual)

### `server/`

- Sem mudanças neste change
- Continua servindo `web/` e, no futuro, `mobile/` com os mesmos contratos

## Fase ponte (até mobile M0)

Enquanto `mobile/` não existir, **`web/` implementa o MVP completo** (M1–M5) como interface única disponível. O reposicionamento é **documental e estrutural** (rename + visão); a poda de features consumer do web ocorre **após** mobile M0, em change futuro.

**Confirmado (2026-06-16):** fase ponte com MVP completo no `web/` até mobile M0.

## O que NÃO muda

- Constitution (princípios de produto)
- Contratos API em `shared/api-contracts.md`
- Auth cookie `po_auth` + antiforgery
- Multi-família via `X-Family-Id`
- Entidades e schema PostgreSQL

## Motivo do breaking agora

Evitar ambiguidade de que `client/` é o produto principal. O rename antecipa a arquitetura real e libera `mobile/` como diretório reservado sem conflito de naming.
