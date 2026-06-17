# Design — Mobile

**Versão:** 1.0.0  
**Data:** 2026-06-17  
**Base:** `.specs/design/DESIGN.md` (tokens compartilhados)  
**Resolução base:** 375×667 (iPhone SE / mínimo suportado)  
**Safe area:** respeitar `env(safe-area-inset-*)` em todos os layouts

> **Uso obrigatório:** Toda UI mobile deve usar tokens de `DESIGN.md` §1 e layouts deste documento. Nunca hex inline em modules.

---

## 1. Herança de tokens

Cores, tipografia (Urbanist), espaçamento, radius e princípios P01–P07 vêm de [`.specs/design/DESIGN.md`](DESIGN.md).

Implementação NativeWind: mapear tokens para `tailwind.config.js` / CSS vars em `presentation/styles/tokens.ts`.

---

## 2. Navegação principal — Wave Tab Bar

**Princípio:** P06 do DESIGN.md — tab bar orgânica com botão central elevado.

### Abas (MVP)

| Posição | Ícone | Label | Rota |
|---------|-------|-------|------|
| 1 | `phone` | Ligações | `/(app)/` (feed) |
| 2 | `calendar` | Calendário | `/(app)/calendar` |
| **centro** | `plus` | **Registrar** | sheet "Liguei agora" |
| 3 | `target` | Metas | `/(app)/goals` |
| 4 | `user` | Perfil | `/(app)/profile` |

### Especificação visual

- Altura tab bar: 64px + safe area bottom
- Fundo: `bg_cream` com borda superior `rgba(107,88,67,0.08)`
- Tab ativa: círculo 40×40px `bg_dark_green`, ícone `text_light`
- Botão central: -20px acima da barra, círculo 56px `serenity_green_60`, ícone `plus` branco
- SVG concavidade central (corte U) — reutilizar spec P06

**Componente:** `ui/Navigation/WaveTabBar/`

---

## 3. Header global

| Elemento | Regra |
|----------|-------|
| Família ativa | Chip com nome da família; tap abre seletor |
| Assistido ativo | Avatar + nome (Pai/Mãe); tap abre sheet de seleção |
| Altura | 56px + safe area top |
| Fundo | `bg_cream` ou `glass_light` em scroll |

---

## 4. Telas-chave

### 4.1 Login

- Fundo `bg_cream` full screen
- Logo + tagline centralizados
- Botão Google: largura 100%, max 320px, `serenity_green_60`
- Sem split layout (diferente do web admin)

### 4.2 Onboarding

- Step único MVP: criar família OU entrar com código
- Cards empilhados verticalmente, padding 16px
- CTA primário fixo no bottom (acima da safe area)

### 4.3 Feed (home)

- Lista cronológica de atividades da família
- Card: `glass_light`, radius 16px, padding 16px
- FAB alternativo: botão central da tab bar ("Liguei agora")

### 4.4 Registrar ligação (sheet)

- Bottom sheet, radius top 24px
- Campo assistido (pré-preenchido com ativo)
- Campo notas (opcional, multiline)
- CTA "Registrar" — `serenity_green_60`

### 4.5 Calendário mensal

- Grid 7 colunas, células 44×44px mínimo
- Dia com atividade: dot `serenity_green_60`
- Tap no dia: lista de atividades do dia

### 4.6 Seletor de assistido

- Bottom sheet com lista de Parents da família
- Item: avatar placeholder + nome + relação (Pai/Mãe)

---

## 5. Componentes mobile-specific

| Componente | Tokens | Notas |
|------------|--------|-------|
| `WaveTabBar` | P06, `bg_dark_green` | Navegação principal |
| `BottomSheet` | `bg_cream`, radius 24px top | Ações e seleções |
| `AssistidoChip` | `mindful_brown_60` | Header |
| `ActivityCard` | `glass_light`, 16px radius | Feed |
| `CallNowButton` | `serenity_green_60`, 56px | CTA central tab |
| `CalendarGrid` | `text_dark_brown`, dots `serenity_green_60` | Calendário |

---

## 6. Gestos e animações

| Gesto | Ação |
|-------|------|
| Pull-to-refresh | Feed, calendário |
| Swipe down | Fechar bottom sheet |
| Tap longo | — (fora do MVP) |

Animações: `duration_base` (250ms), easing ease-out. Sem animações decorativas excessivas.

---

## 7. Acessibilidade

- Contraste ≥ 4.5:1 (mesmos critérios T03 do DESIGN.md)
- Touch targets mínimo 44×44px
- Labels em todos os ícones de tab e botões
- Suporte a font scaling do sistema

---

## 8. Testes de conformidade mobile

| ID | Verificação |
|----|-------------|
| M-T01 | Tokens de cor da paleta DESIGN.md §1 |
| M-T02 | Wave tab bar com botão central -20px |
| M-T03 | Safe area respeitada em header e tab bar |
| M-T04 | Touch targets ≥ 44px |
| M-T05 | Bottom sheets com radius 24px top |
| M-T06 | Zero hex inline em `presentation/modules/` |

---

## Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-06-17 | Versão inicial — stack Expo + layouts mobile |
