# Project Ours - UI/UX Design System

> **Reference**: Wireframes, fluxos de telas, componentes e padrões visuais

---

## Princípios de Design

### Mobile-First
- Design principal: 375px (iPhone SE)
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch targets: mínimo 44x44px

### Sem Rankings
- Feed cronológico, NUNCA listas ordenadas por "mais ativo"
- Cores neutras para todos os usuários (sem destaque competitivo)
- Privacidade visual: nunca mostrar valores individuais

### Acessibilidade Mínima
- Labels em todos os inputs
- Contraste AA (4.5:1)
- Foco visível em todos os elementos interativos

---

## Paleta de Cores

```css
/* Cores Principais */
--primary-500: #3B82F6;      /* Azul principal (botões) */
--primary-600: #2563EB;      /* Azul hover */
--primary-100: #DBEAFE;      /* Azul background */

/* Cores de Status */
--success-500: #10B981;      /* Verde (meta completa, sucesso) */
--warning-500: #F59E0B;      /* Amarelo (aviso, convite expirando) */
--error-500: #EF4444;        /* Vermelho (erro, rejeitado) */

/* Neutros */
--gray-900: #111827;         /* Texto principal */
--gray-600: #4B5563;         /* Texto secundário */
--gray-400: #9CA3AF;         /* Placeholder, bordas */
--gray-100: #F3F4F6;         /* Background */
--white: #FFFFFF;            /* Cards, superfícies */

/* Uso Específico */
--family-brand: #6366F1;     /* Ícone família */
--goal-brand: #8B5CF6;       /* Ícone metas */
--call-brand: #10B981;       /* Botão "Liguei Agora" */
```

---

## Tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|----------|-------|---------|------|-----|
| H1 (Título página) | Inter | 24px | 700 | gray-900 |
| H2 (Seção) | Inter | 20px | 600 | gray-900 |
| H3 (Card) | Inter | 16px | 600 | gray-900 |
| Body | Inter | 14px | 400 | gray-900 |
| Body Small | Inter | 12px | 400 | gray-600 |
| Button | Inter | 14px | 600 | white/primary |
| Caption | Inter | 10px | 400 | gray-400 |

---

## Componentes Base

### Botões

```
┌─────────────────────────────────┐
│  🔵 BOTÃO PRIMÁRIO              │
│                                 │
│  Background: primary-500        │
│  Texto: white, 14px, semibold   │
│  Padding: 12px 24px             │
│  Border-radius: 8px             │
│  Hover: primary-600             │
│  Disabled: gray-400 opacity 0.5│
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  ⚪ BOTÃO SECUNDÁRIO            │
│                                 │
│  Background: white              │
│  Border: 1px gray-300           │
│  Texto: gray-700                │
│  Hover: gray-50                 │
└─────────────────────────────────┘
```

### Cards

```
┌─────────────────────────────────┐
│  CARD PADRÃO                    │
│                                 │
│  Background: white              │
│  Border-radius: 12px            │
│  Shadow: 0 1px 3px rgba(0,0,0,0.1)│
│  Padding: 16px                  │
│  Margin-bottom: 12px            │
└─────────────────────────────────┘
```

### Inputs

```
┌─────────────────────────────────┐
│  INPUT TEXTO                    │
│                                 │
│  Border: 1px gray-300           │
│  Border-radius: 8px             │
│  Padding: 12px 16px             │
│  Focus: primary-500 border      │
│  Error: error-500 border        │
└─────────────────────────────────┘
```

---

## Fluxos de Telas

### 1. Onboarding (Primeiro Acesso)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TELA LOGIN    │────>│   ONBOARDING    │────>│   DASHBOARD     │
│                 │     │                 │     │                 │
│ • Logo Ours     │     │ • Boas-vindas   │     │ • Feed          │
│ • "Entrar com   │     │ • "Criar minha  │     │ • Botão ligação │
│   Google"       │     │   família"      │     │ • Resumo semana │
│ • Frase         │     │ • Input nome    │     │                 │
│   inspiradora   │     │ • Botão criar   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘

        │
        │ (se já autenticado)
        └───────────────────────────────────────────────────────────────┐
                                                                        │
        ┌─────────────────┐     ┌─────────────────┐                     │
        │  SELECIONAR     │     │   DASHBOARD     │<────────────────────┘
        │  FAMÍLIA        │────>│                 │
        │                 │     │                 │
        │ • Lista de      │     │ (contexto da    │
        │   famílias      │     │  família        │
        │ • Badge admin   │     │  selecionada)   │
        │ • Botão criar   │     │                 │
        │   nova          │     │                 │
        └─────────────────┘     └─────────────────┘
```

### 2. Registro de Ligação

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DASHBOARD     │────>│  TIMER LIGAÇÃO  │────>│  MODAL FINAL    │
│                 │     │                 │     │                 │
│ • Botão         │     │ • Timer 00:00   │     │ • Input         │
│   "Liguei       │     │ • Botão         │     │   duração       │
│   Agora"        │     │   "Finalizar"   │     │ • Input notas   │
│   (destaque)    │     │                 │     │ • Botão salvar  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   DASHBOARD     │
                                              │   ATUALIZADO    │
                                              │   • Nova        │
                                              │     atividade   │
                                              │     no feed     │
                                              └─────────────────┘
```

### 3. Convite e Aprovação

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ADMIN GERA     │     │  IRMÃO RECEBE   │     │  IRMÃO SOLICITA │
│  CONVITE        │     │  LINK           │     │  ENTRADA        │
│                 │     │                 │     │                 │
│ • Tela Família  │     │ • URL com       │     │ • Vê nome da    │
│ • Botão         │     │   código        │     │   família       │
│   "Convidar"    │     │ • "Você foi     │     │ • "Solicitar    │
│ • Modal com     │     │   convidado..." │     │   entrada"      │
│   código/URL    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  ADMIN APROVA   │<────│  ADMIN VÊ       │<────│  STATUS:        │
│                 │     │  SOLICITAÇÃO    │     │  AGUARDANDO     │
│ • Lista         │     │                 │     │  APROVAÇÃO      │
│   pendentes     │     │ • Lista com     │     │                 │
│ • Botão         │     │   nome/email    │     • Mensagem:     │
│   "Aprovar"     │     │ • "Aprovar" /   │     │   "Aguardando   │
│ • Notificação   │     │   "Rejeitar"    │     │   aprovação"    │
│   de sucesso    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  IRMÃO AGORA    │
│  É MEMBRO       │
│                 │
│ • Acesso ao     │
│   dashboard     │
│   da família    │
└─────────────────┘
```

### 4. Meta Financeira

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  LISTA METAS    │────>│   CRIAR META    │────>│  DETALHE META   │
│                 │     │   (Modal)       │     │                 │
│ • Metas ativas  │     │ • Título        │     │ • Progresso     │
│ • Botão         │     │ • Valor alvo    │     │ • Botão         │
│   "+Nova Meta"  │     │ • Botão criar   │     │   "Contribuir"  │
│ • Progress bars │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  MODAL CONTRIB  │
                                              │                 │
                                              │ • Input valor   │
                                              │ • Botão         │
                                              │   confirmar     │
                                              └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  META COMPLETA! │<────│  ATUALIZAÇÃO    │<────│  CONFIRMAÇÃO    │
│                 │     │  AUTOMÁTICA     │     │                 │
│ • Banner 🎉     │     │                 │     │ • Valor         │
│ • Barra 100%    │     │ • Barra         │     │   registrado    │
│ • Botão         │     │   animada       │     │ • Progresso     │
│   desabilitado  │     │ • Toast sucesso │     │   atualizado    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Wireframes Detalhados

### Tela de Login

```
┌─────────────────────────┐
│                         │
│      [OURS LOGO]        │
│         📱❤️            │
│                         │
│   Cuide dos seus pais   │
│   junto com seus irmãos │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  🔵 Entrar com    │  │
│  │     Google        │  │
│  └───────────────────┘  │
│                         │
│                         │
│  Termos de uso • Privacidade
│                         │
└─────────────────────────┘
```

**Specs:**
- Logo: 80x80px, centralizado
- Frase: 16px, gray-600, center
- Botão Google: full-width menos 32px padding, 48px height
- Footer: 12px, gray-400

---

### Onboarding

```
┌─────────────────────────┐
│  ←                      │
│                         │
│   Bem-vindo! 🎉         │
│                         │
│   Para começar, crie    │
│   sua família:          │
│                         │
│   Nome da Família       │
│  ┌───────────────────┐  │
│  │ Família Silva     │  │
│  └───────────────────┘  │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  Criar Família    │  │
│  └───────────────────┘  │
│                         │
│  Ao criar, você será    │
│  o administrador e      │
│  poderá convidar seus   │
│  irmãos.                │
│                         │
└─────────────────────────┘
```

---

### Dashboard (Tela Principal)

```
┌─────────────────────────┐
│  [Logo]          [😊▼]  │  ← Header com avatar
│                         │
│  Olá, João! 👋          │
│                         │
│  ┌───────────────────┐  │
│  │  📞 LIGUEI AGORA  │  │  ← Botão principal
│  │                   │  │
│  │   ┌─────────┐     │  │
│  │   │  📱   │     │  │
│  │   └─────────┘     │  │
│  │    Toque para     │  │
│  │    registrar      │  │
│  └───────────────────┘  │
│                         │
│  ── Resumo da Semana ── │
│                         │
│  ┌─────┐ ┌─────┐ ┌────┐ │
│  │📞   │ │📞   │ │💰  │ │  ← Cards scrolláveis
│  │ 8   │ │ 3   │ │ 75%│ │     horizontalmente
│  │totais│ │suas │ │meta│ │
│  └─────┘ └─────┘ └────┘ │
│                         │
│  ──── Atividades ────   │
│                         │
│  ┌───────────────────┐  │
│  │ 😊 Ana            │  │
│  │ ligou para o Pai  │  │
│  │ • 15 min • hoje   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 😊 Você           │  │
│  │ ligou para a Mãe  │  │
│  │ • 20 min • ontem  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🎉 Meta atingida! │  │
│  │ Remédio atingiu   │  │
│  │ 100% • há 2 horas │  │
│  └───────────────────┘  │
│                         │
│  ┌────────┬────────┬───┐│
│  │ 🏠     │  👨‍👩‍👧   │ 💰││  ← Bottom nav
│  │Início  │Família │Metas│
│  └────────┴────────┴───┘│
└─────────────────────────┘
```

---

### Timer de Ligação

```
┌─────────────────────────┐
│  ←           Ligação    │
│                         │
│                         │
│         ┌─────┐         │
│         │ 📞  │         │
│         │     │         │
│         │15:42│         │  ← Timer grande
│         │     │         │
│         └─────┘         │
│                         │
│       Em andamento...   │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  Finalizar        │  │
│  │  Ligação          │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

---

### Modal Finalizar Ligação

```
┌─────────────────────────┐
│                         │
│   ┌───────────────┐     │
│   │               │     │
│   │  📞           │     │
│   │               │     │
│   │  Como foi a   │     │
│   │  ligação?     │     │
│   │               │     │
│   │  Duração      │     │
│   │  ┌─────────┐  │     │
│   │  │ 15 min  │  │     │
│   │  └─────────┘  │     │
│   │               │     │
│   │  Notas        │     │
│   │  ┌─────────┐  │     │
│   │  │Conversa │  │     │
│   │  │sobre... │  │     │
│   │  └─────────┘  │     │
│   │               │     │
│   │  ┌─────────┐  │     │
│   │  │ Salvar  │  │     │
│   │  └─────────┘  │     │
│   │               │     │
│   └───────────────┘     │
│                         │
└─────────────────────────┘
```

---

### Tela Família

```
┌─────────────────────────┐
│  ←           Família    │
│                         │
│  ┌───────────────────┐  │
│  │ 🏠 Família Silva  │  │
│  │ [Admin]           │  │  ← Badge admin
│  └───────────────────┘  │
│                         │
│  ───── Membros ──────   │
│                         │
│  ┌───────────────────┐  │
│  │ 😊 João (você)    │  │
│  │    Admin • desde Maio │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 😊 Ana            │  │
│  │    Membro • desde │  │
│  │    Maio           │  │
│  └───────────────────┘  │
│                         │
│  [+ Convidar Irmão]     │  ← Apenas admin
│                         │
│  ─────── Pais ───────   │
│                         │
│  ┌───────────────────┐  │
│  │ 👤 Mãe            │  │
│  │ 64 anos           │  │
│  │ >                 │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 👤 Pai            │  │
│  │ 66 anos           │  │
│  │ >                 │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

---

### Modal Convidar Irmão

```
┌─────────────────────────┐
│                         │
│   ┌───────────────┐     │
│   │               │     │
│   │  👨‍👩‍👧        │     │
│   │               │     │
│   │  Convidar     │     │
│   │  Irmão        │     │
│   │               │     │
│   │  Envie este   │     │
│   │  link. Expira │     │
│   │  em 24h:      │     │
│   │               │     │
│   │  ┌─────────┐  │     │
│   │  │ABC123   │  │     │  ← Código destacado
│   │  └─────────┘  │     │
│   │               │     │
│   │  [🔗 Copiar   │     │
│   │      Link]    │     │
│   │               │     │
│   │  ─── ou ───   │     │
│   │               │     │
│   │  [Gerar novo] │     │
│   │               │     │
│   │  Expira em:   │     │
│   │  02/05 10:00  │     │
│   │               │     │
│   └───────────────┘     │
│                         │
└─────────────────────────┘
```

---

### Tela Metas Financeiras

```
┌─────────────────────────┐
│  ←           Metas      │
│                         │
│  ┌───────────────────┐  │
│  │ 💰 R$ 350 de R$ 500 │ │
│  │ arrecadados este mês│ │
│  └───────────────────┘  │
│                         │
│  [+ Nova Meta]          │
│                         │
│  ──── Minhas Contrib ── │
│  Você contribuiu R$ 150 │
│                         │
│  ─────── Metas ───────  │
│                         │
│  ┌───────────────────┐  │
│  │ Remédio de Junho  │  │
│  │                   │  │
│  │ ████████████░░ 70% │  │
│  │                   │  │
│  │ R$ 350 de R$ 500  │  │
│  │ 12 contribuições  │  │
│  │ [Ativa]      [>]  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Exame Julho       │  │
│  │                   │  │
│  │ ██████████████████ │  │
│  │ 100% 🎉           │  │
│  │ R$ 800 de R$ 800  │  │
│  │ [Completa]   [>]  │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

---

## Navegação

### Bottom Navigation (Mobile)

```
┌─────────────────────────┐
│  🏠      👨‍👩‍👧      💰   │
│ Início  Família   Metas │
└─────────────────────────┘
```

- Altura: 64px
- Background: white
- Border-top: 1px gray-200
- Ícone: 24px
- Label: 12px
- Active: primary-500
- Inactive: gray-400

---

## Estados de UI

### Loading
```
┌─────────────────────────┐
│                         │
│    ┌─────────────┐      │
│    │ ██████░░░░░ │      │  Skeleton pulse
│    └─────────────┘      │
│                         │
│    ┌─────────────┐      │
│    │ ████████░░░ │      │
│    └─────────────┘      │
│                         │
└─────────────────────────┘
```

### Empty State
```
┌─────────────────────────┐
│                         │
│         📭              │
│                         │
│   Nenhuma atividade     │
│   ainda                 │
│                         │
│   Seja o primeiro a     │
│   ligar para seus pais! │
│                         │
│   [Registrar Ligação]   │
│                         │
└─────────────────────────┘
```

### Error
```
┌─────────────────────────┐
│                         │
│         ⚠️              │
│                         │
│   Algo deu errado       │
│                         │
│   Não foi possível      │
│   carregar os dados     │
│                         │
│   [Tentar novamente]    │
│                         │
└─────────────────────────┘
```

---

## Próximos Passos

1. **[Fluxos de Tela no PRD](../prd-summary.md)** — User Stories detalhadas
2. **[Testing Guide](../03-how-to/testing-guide.md)** — Testes de UI/UX
3. **[Agent Context](../04-agent/agent-context.md)** — Contexto visual para IA

---

*Versão Design: 1.0 | Mobile-First | Última atualização: Maio 2026*
