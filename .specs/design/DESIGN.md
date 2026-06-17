# Design Specification — Project Ours

**Versão:** 1.4.0  
**Data:** 2026-06-17  
**Fonte:** Análise de referências Freud.ai v1.0 (adaptado para Project Ours)  
**Escopo:** tokens compartilhados (todas as plataformas)  
**Layouts por plataforma:** [mobile.md](mobile.md) · §6 web admin  
**Modo de cor:** RGB

> **Uso obrigatório:** Toda criação ou alteração de UI deve consultar este documento (tokens) + layout da plataforma antes de escrever código. Agentes SDD: mapear cada componente a pelo menos um princípio (P01–P07).

**Referências visuais:** `.specs/changes/005-design-specification/references/`  
**Integração técnica:** `.specs/archive/005-design-specification/design.md` (paths runtime: `web/src/`)

---

## 1. Design Tokens

### 1.1 Cores

#### Hierarquia semântica (significado → token)

| Significado | Token | Hex | Quando usar |
|-------------|-------|-----|-------------|
| **Ação primária** | `serenity_green_60` | `#5A6838` | Confirmar, avançar, salvar, CTA principal |
| **Confiança / comunicação** | `trust_blue_60` | `#2B5F8A` | Links, convites, mensagens, info contextual |
| **Apoio / destaque especial** | `kind_purple_60` | `#5349A5` | Suporte, features premium, badges de cuidado |
| **Alerta / ação urgente** | `action_orange_40` | `#E87A2D` | Atenção, confirmação destrutiva, prazo |
| **Destaque vibrante** | `action_orange_vivid` | `#ED7E1C` | Hero, banners, ícones de urgência controlada |
| **Conteúdo / estrutura** | `mindful_brown_60` | `#6B5843` | Títulos, navegação, ícones funcionais |
| **Sucesso** | `success` | `#9BB06B` | Conclusão, meta atingida, feedback positivo |
| **Aviso** | `warning` | `#D7A300` | Prazo próximo, atenção sem urgência |

> **Identidade:** tons profundos e azul/roxo transmitem segurança; laranja potencializado para urgência sem agressividade; cream e marrom mantêm calor parental — nunca frio/clínico.

#### Primárias

| Token | Hex | Uso | Contraste mínimo |
|-------|-----|-----|------------------|
| `mindful_brown_60` | `#6B5843` | Títulos, navegação, ícones funcionais | ≥ 4.5:1 sobre `bg_cream` |
| `serenity_green_60` | `#5A6838` | Botões primários, ações confirmadas | ≥ 4.5:1 com `text_light` |
| `trust_blue_60` | `#2B5F8A` | Links, convites, comunicação familiar | ≥ 4.5:1 com `text_light` |
| `kind_purple_60` | `#5349A5` | Apoio, destaques de cuidado, modais de suporte | ≥ 4.5:1 com `text_light` |
| `action_orange_40` | `#E87A2D` | Alertas, ações urgentes, delete | ≥ 4.5:1 com `text_light` |
| `action_orange_vivid` | `#ED7E1C` | Hero, badges, destaques promocionais | ≥ 4.5:1 sobre `bg_cream` |

#### Fundos

| Token | Hex | Uso |
|-------|-----|-----|
| `bg_cream` | `#FCF8F4` | Fundo principal (modo claro) — calor parental |
| `bg_deep` | `#1E2433` | Modais, nav imersiva, seções escuras (ref. `#1A1A2E` aquecido) |
| `bg_deep_alt` | `#1C1C1E` | Overlay, sheets, fundo de alto contraste |
| `bg_surface_dark` | `#2A3142` | Cards elevados sobre `bg_deep` |
| `bg_dark_green` | `#2D3E26` | Tab ativa, sidebars orgânicas |
| `bg_orange` | `#ED7E1C` | Seções hero, banners (substitui `#F6852D`) |

#### Superfícies glass (blur sutil)

| Token | Valor | Uso |
|-------|-------|-----|
| `glass_light` | `rgba(252,248,244,0.72)` + `blur(12px)` + borda `rgba(107,88,67,0.08)` | Cards sobre cream |
| `glass_dark` | `rgba(42,49,66,0.75)` + `blur(16px)` + borda `rgba(255,255,255,0.08)` | Cards sobre `bg_deep` |

#### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `text_dark_brown` | `#2E1E12` | Corpo principal sobre fundos claros |
| `text_light` | `#FFFFFF` | Texto sobre fundos escuros e botões coloridos |
| `text_muted` | `#928D86` | Secundário (Optimistic Gray 50 — tom quente) |
| `text_on_deep` | `#F5F5F5` | Corpo sobre `bg_deep` |

#### Semânticas

| Role | Hex | Notas |
|------|-----|-------|
| `success` | `#9BB06B` | Serenity Green 50 |
| `warning` | `#D7A300` | Zen Yellow 60 |
| `error` | `#E87A2D` | Action orange — urgente, não agressivo |
| `info` | `#2B5F8A` | Trust blue — comunicação, não marrom |

#### Escalas de referência (Freud.ai adaptadas)

Cada escala tem 10 tons (100 = mais escuro, 10 = mais claro). Usar tons 40–70 para interativos; 10–20 para fundos suaves.

- **Mindful Brown** — `#372315` → `#F7F4F2`
- **Serenity Green** — `#191E10` → `#F2F5EB`
- **Empathy Orange** — `#2E1200` → `#FFEEE2` (40 = `#ED7E1C`)
- **Kind Purple** — `#161324` → `#F6F1FF` (60 = `#6C5FCB`, 70 = `#5349A5`)
- **Trust Blue** (derivada) — `#16213E` → `#E8F0F8` (60 = `#2B5F8A`)

#### Regras de cor

- Fundo principal do app: `bg_cream` (modo claro padrão)
- Modais e sheets críticos: `bg_deep` ou `glass_dark` com texto `text_on_deep`
- Badges/tags: cor semântica a **15% opacidade** sobre o fundo atual
- Laranja: reservado para alerta/ação urgente — nunca como cor primária de navegação
- Azul/roxo: confiança e comunicação — nunca para erro ou delete
- Proibido: cinzas frios (blue-gray puro), preto `#000000`, branco puro `#FFFFFF` como fundo de página
- Decorativo: textura de pontos com `mindful_brown_60` a **3% opacidade**

---

### 1.2 Tipografia

**Família base:** Urbanist  
**Fallbacks:** Outfit, Poppins, sans-serif

| Role | Size | Weight | Line-height | Letter-spacing |
|------|------|--------|-------------|----------------|
| `display_lg` | 48px | 800 | 1.1 | -0.02em |
| `display_md` | 36px | 700 | 1.2 | -0.01em |
| `heading_2xl` | 32px | 700 | 1.2 | 0 |
| `heading_xl` | 28px | 600 | 1.3 | 0 |
| `heading_lg` | 24px | 600 | 1.4 | 0 |
| `heading_md` | 20px | 500 | 1.4 | 0 |
| `body_lg` | 18px | 400 | 1.5 | 0 |
| `body_md` | 16px | 400 | 1.5 | 0.005em |
| `body_sm` | 14px | 400 | 1.4 | 0.005em |
| `label` | 12px | 500 | 1.3 | 0.01em |

**Transformações permitidas:** `uppercase`, `capitalize`, `none`

**Títulos de seção:** role `label`, `text-transform: uppercase`, tracking 1%

**Constraints:**

- Nenhum tamanho fora da escala
- Pesos permitidos: 400, 500, 600, 700, 800 apenas

---

### 1.3 Espaçamento

- **Unidade base:** 8px
- **Escala permitida:** `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80` (px)
- **Regra:** todo padding, margin, gap deve pertencer à escala
- **Defaults:**
  - Cards e botões: padding interno **16px**
  - Listas: gap **8px**
  - Seções: padding **24px**

> 4px só para micro-ajustes (ícones alinhados, border). Nunca para padding de componentes interativos.

---

### 1.4 Bordas

| Token | Valor | Uso |
|-------|-------|-----|
| `radius_sm` | 8px | Inputs, campos de texto |
| `radius_md` | 12px | Botões |
| `radius_lg` | 16px | Cards, modais |
| `radius_xl` | 24px | Ilustrações, imagens |
| `radius_pill` | 999px | Pills, badges |

- **Largura:** 1px solid
- Proibido: `border-radius: 0` em elementos interativos

---

### 1.5 Sombras

| Level | Valor |
|-------|-------|
| `shadow_low` | `0 2px 8px rgba(0,0,0,0.06)` |
| `shadow_medium` | `0 4px 16px rgba(0,0,0,0.10)` |
| `shadow_high` | `0 8px 32px rgba(0,0,0,0.12)` |

Cards e modais usam `shadow_medium`.

---

### 1.6 Grid

| Propriedade | Valor |
|-------------|-------|
| Colunas | 12 |
| Gutter | 16px |
| Margin lateral | 16px |
| Max width | 1200px |

Elementos ocupam número inteiro de colunas. Cards: 100% ou múltiplos de 2 colunas (6, 4, 3).

**Exceções:** hero full-bleed; avatares com posicionamento absoluto.

---

### 1.7 Motion

| Token | Valor |
|-------|-------|
| `duration_fast` | 150ms |
| `duration_base` | 250ms |
| `duration_slow` | 400ms |
| `easing_standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `easing_decelerate` | `cubic-bezier(0, 0, 0.2, 1)` |

Hover e focus transitions usam `duration_base`.

---

### 1.8 Ícones e ilustrações

- Estilo: **flat outline**, traço uniforme **2px**
- Tamanho padrão: **24×24px**
- Cor: `mindful_brown_100` sobre `bg_cream`; `text_light` sobre fundos escuros
- Filled: apenas tab ativa ou ícone dentro de CTA circular
- Gráficos: paleta green/orange/brown; áreas não preenchidas a 15% opacidade
- Loading: spinner circular, cor `serenity_green_60`

---

## 2. Design Principles

### P01 — Escala tipográfica Urbanist

Todo texto usa um `role` da escala. Títulos ExtraBold/Bold; corpo Regular; subheadings Medium.

**Válido:** Heading com `heading_2xl` (32px / 700 / 1.2)  
**Inválido:** Heading 28px weight 500 (28px + 500 não compõem um role válido)

---

### P02 — Espaçamento baseado em 8

Paddings, margins e gaps pertencem à escala. Sem valores arbitrários (5px, 7px, 13px).

**Válido:** `padding: 16px 24px`  
**Inválido:** `padding: 15px 25px`

---

### P03 — Paleta acolhedora com hierarquia semântica

Tons orgânicos (brown, green) + confiança (blue, purple) + urgência controlada (orange). Fundos profundos aquecidos para modais/nav; cream para o app principal. Sem cinzas frios nem preto puro.

**Válido:** CTA primário verde; convite/link azul; delete laranja; modal escuro com card glass  
**Inválido:** Delete em vermelho puro; fundo `#000000`; laranja como cor de navegação principal

---

### P04 — Contraste acessível (WCAG AA)

Texto funcional ≥ 4.5:1.

| Fundo | Texto |
|-------|-------|
| `bg_cream` | `text_dark_brown` ou `mindful_brown_60` |
| `bg_deep` / `bg_surface_dark` | `text_on_deep` ou `text_light` |
| `bg_dark_green` | `text_light` |
| `bg_orange` | `text_light` ou `mindful_brown_60` |
| Botão primário (verde/azul/roxo) | `text_light` |
| Botão alerta (laranja) | `text_light` |

**Exceção:** elementos puramente decorativos; badges de status com fundo sólido (indicador visual, não texto longo).

---

### P05 — Morfologia arredondada

| Componente | Radius |
|------------|--------|
| Cards, modais | 16px + `shadow_medium` |
| Botões | 12px |
| Inputs | 8px |
| Pills, badges | 999px |
| Imagens | 24px |

---

### P06 — Navegação em onda (Wave Tab Bar)

Para telas com navegação principal mobile:

- Altura mínima **64px** (com padding)
- Botão central elevado **-20px** no eixo Y
- Botão central: `radius_pill`, fundo `serenity_green_60`, ícone + branco
- Tabs: ícones outline 24px
- Tab ativa: círculo 40×40px `bg_dark_green`, ícone `text_light`
- SVG concavidade central (corte U); CSS var `--tab-bar-height`

**Implementação:** `client/src/ui/Navigation/WaveTabBar/` (change 006). Compor via `AppShell` em rotas `(app)`.

---

### P07 — Grid de 12 colunas

Margens 16px, gutter 16px. Larguras em colunas inteiras.

---

## 3. Mapeamento de componentes

| Componente `ui/` | Tokens principais |
|------------------|-------------------|
| `Button` primary | bg `serenity_green_60`, text `text_light`, radius 12px |
| `Button` secondary | border `mindful_brown_60`, text `mindful_brown_60`, radius 12px |
| `Button` trust | bg `trust_blue_60`, text `text_light`, radius 12px |
| `Button` alert/destructive | bg `action_orange_40`, text `text_light`, radius 12px |
| `Button` support | bg `kind_purple_60`, text `text_light`, radius 12px |
| `TextInput` | radius 8px, padding 16px, border 1px |
| `Title` | roles `heading_*` ou `display_*` |
| `Text` | roles `body_*` |
| `Alert` | cores semânticas + radius 12px |
| `Modal` | radius 16px, shadow medium, padding 24px |
| `Container` | max-width 1200px, margin 16px |

Modules em `presentation/modules/` compõem estes componentes — **nunca** estilizam com hex inline.

---

## 4. Testes de conformidade

| ID | Verificação | Esperado |
|----|-------------|----------|
| T01 | Todo texto usa role da escala tipográfica | true |
| T02 | Espaçamentos na escala [4,8,12,16,20,24,32,40,48,64,80] | true |
| T03 | Contraste texto funcional ≥ 4.5:1 | true |
| T04 | Radius por tipo de componente (P05) | true |
| T05 | Cores na paleta definida | true |
| T06 | Tab bar com wave shape e botão central -20px (quando existir) | true |

---

## 5. Instruções para agentes de IA

### Criação

1. Ler tokens da seção 1 como única fonte de verdade
2. Mapear cada componente a P01–P07
3. Especificar componente em JSON mental (role, tokens, spacing) antes de codar
4. Importar de `@/ui/*`; strings via next-intl
5. Incluir wave tab bar em layouts de navegação principal (quando aplicável)

### Ajuste de UI existente

1. Executar testes T01–T06
2. Para cada falha: identificar princípio violado
3. Relatório: `elemento | propriedade | valor_original | valor_corrigido | princípio`
4. Cor fora da paleta → `trust_blue_60` (info), `serenity_green_60` (ação) ou `action_orange_40` (alerta)

### Invariantes (nunca violar)

- Paleta: brown, green, trust blue, kind purple, action orange, `bg_cream`, `bg_deep`
- Hierarquia semântica da tabela 1.1
- Espaçamento base: 8px
- Fonte: Urbanist
- Margens grid: 16px
- Cards 16px radius; botões 12px radius

### Variáveis permitidas (dentro das regras)

- Tom de ícones secundários (paleta marrom/cinza)
- Ilustrações orgânicas stroke 2px
- Badges com cores semânticas + `radius_pill`
- Hover animations com `duration_base` (250ms)

---

## 6. Plataforma Web (admin PWA)

Aplicável apenas ao pacote `web/`. Tokens de cor/tipografia permanecem iguais; **layout** é desktop-first.

| Elemento | Regra |
|----------|-------|
| Shell | Sidebar fixa 260px (`bg_dark_green`) a partir de `lg` (1024px); topbar em viewports menores |
| Conteúdo | `Page` + max-width 960px, padding 32px |
| Auth | Split 50/50 em `lg`: hero esquerdo + card direito (max 440px) |
| Cards | `SurfaceCard` / `glass-light`, radius 16px — nunca `zinc-*` cru |
| Formulários admin | Grid 2 colunas em `lg` quando há blocos paralelos (ex.: criar + entrar com código) |
| Navegação | Links na sidebar; sem bottom tab bar |

**Componentes runtime:** `ui/Layout/Page`, `ui/Layout/SurfaceCard`, `presentation/layouts/auth-layout`, `presentation/modules/app-shell`

**CSS:** classes `web-*` em `web/src/presentation/styles/globals.css`

---

## 7. Metadados

| Campo | Valor |
|-------|-------|
| Imagens analisadas | 12 |
| Confiança | Alta |
| Ambiguidade resolvida | Cream vs branco → cream; pontos decorativos 3% |
| Pendente | Logo Ours definitivo |

**Notas:** Sistema visual de calma e empatia — tons orgânicos (terra, vegetação) com foco em acessibilidade. Adaptado do domínio mental health para cuidado familiar colaborativo sem alterar a linguagem visual.

---

## Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.4.0 | 2026-06-17 | Tokens compartilhados; layouts mobile extraídos para mobile.md |
| 1.3.0 | 2026-06-16 | Seção web admin: sidebar, Page, AuthLayout, desktop-first |
| 1.2.0 | 2026-06-16 | Paleta revisada: trust blue, kind purple, orange potencializado, fundos profundos, glass |
| 1.1.0 | 2026-06-10 | Wave Tab Bar implementada (P06) — change 006; tab ativa `bg_dark_green` |
| 1.0.0 | 2026-06-10 | Versão inicial — change 005 |
