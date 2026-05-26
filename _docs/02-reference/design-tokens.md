# Project Ours - Design Tokens

> **Reference**: Tokens de design para implementação consistente em Mantine + Tailwind

---

## Estrutura de Tokens

Nossa arquitetura usa **Mantine** como tema principal e **Tailwind** como utilitário complementar. Tokens são definidos no tema Mantine e mapeados para classes Tailwind quando necessário.

```
Figma/Design Tokens → Mantine Theme → Tailwind (extend)
```

---

## Cores

### Semantic Tokens (Mantine)

```typescript
// theme.ts - cores primárias
colors: {
  primary: [
    '#EFF6FF',  // 0: 50
    '#DBEAFE',  // 1: 100
    '#BFDBFE',  // 2: 200
    '#93C5FD',  // 3: 300
    '#60A5FA',  // 4: 400
    '#3B82F6',  // 5: 500 (primary)
    '#2563EB',  // 6: 600 (hover)
    '#1D4ED8',  // 7: 700
    '#1E40AF',  // 8: 800
    '#1E3A8A',  // 9: 900
  ],
  // Mantine já inclui gray, red, green, yellow por padrão
}
```

### Tailwind Mapping

| Token | Tailwind Class | Mantine Token |
|-------|---------------|---------------|
| Primary | `bg-primary-500` | `theme.colors.primary[5]` |
| Primary Hover | `hover:bg-primary-600` | `theme.colors.primary[6]` |
| Primary Light | `bg-primary-100` | `theme.colors.primary[1]` |
| Success | `text-green-500` | Mantine `green` |
| Warning | `text-yellow-500` | Mantine `yellow` |
| Error | `text-red-500` | Mantine `red` |

### Uso Específico por Contexto

```typescript
// Botão primário
<Button color="primary">Entrar</Button>
// → bg-primary-500, hover:bg-primary-600

// Status
<Badge color="green">Ativo</Badge>
<Badge color="red">Erro</Badge>
<Badge color="yellow">Pendente</Badge>
```

---

## Tipografia

### Font Stack

```typescript
// Mantine theme
fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
```

### Escala

| Elemento | Mantine | Tailwind | Tamanho | Peso |
|----------|---------|----------|---------|------|
| H1 | `<Title order={1}>` | `text-2xl font-bold` | 24px | 700 |
| H2 | `<Title order={2}>` | `text-xl font-semibold` | 20px | 600 |
| H3 | `<Title order={3}>` | `text-base font-semibold` | 16px | 600 |
| Body | `<Text>` | `text-sm` | 14px | 400 |
| Body Small | `<Text size="sm">` | `text-xs` | 12px | 400 |
| Caption | `<Text size="xs">` | `text-[10px]` | 10px | 400 |

### Cores de Texto

```typescript
// Mantine (usa gray scale interna)
<Text c="dimmed">     // gray-600
<Text c="gray">       // gray-500  
<Text>                // gray-900 (default)
<Text c="red">        // error
```

```css
/* Tailwind equivalentes */
.text-gray-900   /* principal */
.text-gray-600   /* secundário */
.text-gray-400   /* placeholder */
```

---

## Espaçamento

### Escala Mantine (padrão)

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 4px | Ícones pequenos, gaps tight |
| `sm` | 8px | Padding interno compacto |
| `md` | 16px | **Padrão** - padding cards, gaps |
| `lg` | 24px | Espaçamento seções |
| `xl` | 32px | Hero sections |
| `2xl` | 48px | Grandes separações |

### Touch Targets

> **Regra**: Todo elemento interativo deve ter mínimo **44×44px**

```typescript
// Mantine Button já satisfaz (height: 36px + padding)
<Button size="md" fullWidth>  // 48px height (mobile-friendly)

// Ícones com padding mínimo
<ActionIcon size="lg">       // 44px
<Button compact size="sm">   // 32px - apenas desktop
```

---

## Componentes Canônicos

### AuthLayout

Layout centralizado para telas de autenticação.

```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';  // default: 'sm'
}

// Specs
- Full viewport height (min-h-screen)
- Centered flex container
- Padding: 16px (px-4)
- Max-width: 480px (sm)
- Background: gray-50 ou white
```

### PrimaryButton

Botão primário do aplicativo.

```typescript
interface PrimaryButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;  // default: true em mobile
  onClick?: () => void;
}

// Specs
- Height: 48px (size="lg")
- Border-radius: 8px (radius="md")
- Background: primary-500
- Hover: primary-600
- Text: white, 14px, semibold
- Disabled: gray-400, opacity 0.5
```

### PageShell

Container padrão para telas logadas.

```typescript
interface PageShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  padding?: boolean;  // default: true
}

// Specs
- Padding: 16px (p-4)
- Max-width: 100% mobile, 768px tablet+
- Background: gray-50
- Safe areas: env(safe-area-inset-*)
```

---

## Estados de UI

### Loading

```typescript
// Skeleton padrão
<Skeleton height={120} radius="md" />
<Skeleton height={20} width="60%" mt="sm" />

// Spinner em botões
<Button loading loaderProps={{ type: 'dots' }}>
  Entrar
</Button>

// Full page
<Center h="100vh">
  <Loader size="lg" />
</Center>
```

### Empty State

```typescript
<Stack align="center" gap="md" py="xl">
  <ThemeIcon size="xl" variant="light" color="gray">
    <IconInbox size={32} />
  </ThemeIcon>
  <Text size="lg" fw={500}>Nenhuma atividade ainda</Text>
  <Text c="dimmed" ta="center">
    Seja o primeiro a ligar para seus pais!
  </Text>
  <Button>Registrar Ligação</Button>
</Stack>
```

### Error

```typescript
<Alert icon={<IconAlertCircle size={20} />} 
       title="Algo deu errado" 
       color="red"
       variant="filled">
  Não foi possível carregar os dados. 
  <Button variant="white" color="red" mt="sm">
    Tentar novamente
  </Button>
</Alert>
```

---

## Regras de Design (obrigatórias)

### 1. Sem Rankings

Nunca exibir listas ordenadas por "mais ativo", "mais contribuiu", etc.

```typescript
// ✅ Correto
<Text>3 ligações este mês</Text>  // apenas próprio usuário

// ❌ NUNCA
<Text>1º Ana - 10 ligações</Text>
<Text>2º João - 2 ligações</Text>
```

### 2. Privacidade Financeira

Nunca mostrar valores individuais de contribuição.

```typescript
// ✅ Correto
<Text>R$ 350 de R$ 500 arrecadados</Text>
<Text>12 contribuições</Text>
<Text>Você contribuiu R$ 150</Text>  // apenas próprio

// ❌ NUNCA
<Text>João contribuiu R$ 200</Text>
<Text>Maria contribuiu R$ 50</Text>
```

### 3. Mobile-First

```typescript
// Breakpoints (Tailwind)
// Base: mobile < 640px
// sm: 640px+
// md: 768px+
// lg: 1024px+

// Exemplo: padding responsivo
<Box className="px-4 md:px-6 lg:px-8">
```

### 4. Acessibilidade Mínima

```typescript
// Labels obrigatórios
<TextInput label="Nome da família" required />

// Aria-label em ícones
<ActionIcon aria-label="Fechar modal">
  <IconX />
</ActionIcon>

// Foco visível (Mantine já tem)
// Contraste AA (4.5:1) - validar com cores do tema
```

---

## Checklist por PR (UI/UX)

- [ ] Mobile-first: testado em 375px
- [ ] Touch targets ≥ 44px
- [ ] Labels/aria-label em controles
- [ ] Estados loading implementados
- [ ] Estados error implementados
- [ ] Empty state (se aplicável)
- [ ] i18n: strings em `pt-BR.json`
- [ ] Sem rankings ou comparações
- [ ] Privacidade: dados agregados apenas
- [ ] Contraste validado

---

## Referências

- [Mantine Theme](https://mantine.dev/theming/theme-object/)
- [Tailwind Config](https://tailwindcss.com/docs/configuration)
- [UI Design System](./ui-design-system.md) - Wireframes e fluxos
- [Client Standard](../_draft/client-standard.md) - Stack e arquitetura

---

*Versão Tokens: 1.0 | Mobile-First | Última atualização: Maio 2026*
