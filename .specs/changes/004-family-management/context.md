# Change 004 — Context (decisões)

Decisões de implementação para áreas não ambíguas na feature spec.

## D1 — Onboarding não coleta dados dos pais

**Decisão:** Criar família exige apenas `name` (1–100 chars). Cadastro de `Parent` fica para M5.

**Motivo:** PROJECT.md coloca "Admin edita dados dos pais" em M5; reduz escopo do change.

## D2 — Dois caminhos no onboarding

**Decisão:** Uma tela com duas ações: "Criar família" (form nome) e "Tenho um código" (form 6 chars).

**Motivo:** Cobre `familyCount === 0` sem rotas extras; join é alternativa ao create.

## D3 — Formato do código de convite

**Decisão:** 6 caracteres alfanuméricos uppercase (A–Z, 0–9), único globalmente, gerado server-side.

**Motivo:** Alinhado a `FamilyInvite.InviteCode` (`HasMaxLength(6)`, índice único).

## D4 — Validade 24 horas

**Decisão:** `ExpiresAt = UtcNow + 24h` na criação; join rejeita se `UtcNow > ExpiresAt` (status → Expired na validação).

**Motivo:** PROJECT.md MVP — convites 24h.

## D5 — Múltiplos convites pendentes

**Decisão:** Admin pode criar vários convites pendentes; cada código é independente.

**Motivo:** Simplicidade; não invalidar convites anteriores.

## D6 — Refresh de sessão pós create/join

**Decisão:** Mutations client invalidam query `auth/session` e chamam `GET /auth/me`; em sucesso aplicam `applyActiveFamilyFromSession` ou `setFamilyId` explícito.

**Motivo:** `familyCount` e lista `families` vêm da sessão auth; evita duplicar estado.

## D7 — UI de convite

**Decisão:** Seção "Convidar irmão" no dashboard (visível só se `role === Admin` na família ativa); modal com código, expiração e botão copiar.

**Motivo:** Mínimo viável sem nova rota dedicada; dashboard já é destino pós-login.

## D8 — Endpoints e escopo

**Decisão:**

| Método | Rota | Auth | Header |
|--------|------|------|--------|
| POST | `/api/families` | User | — |
| GET | `/api/families/my` | User | — |
| POST | `/api/invite` | User | `X-Family-Id` + Admin |
| POST | `/api/join` | User | — |

**Motivo:** Índice em `.specs/shared/api-contracts.md`.
