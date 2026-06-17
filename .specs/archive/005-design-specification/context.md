# Change 005 — Context (decisões)

Decisões de gray areas capturadas na fase Specify. Agentes e implementadores devem tratar como resolvidas.

## Origem visual

| Decisão | Escolha |
|---------|---------|
| Referência de design | Freud.ai v1.0 (Dribbble) — **apenas estética**, não branding nem copy |
| Nome do produto na UI | **Project Ours** / **Ours** — nunca "Freud" |
| Confiança da extração | Alta (12 telas analisadas) |

## Adaptações para Project Ours

| Padrão Freud.ai | Adaptação Ours |
|-----------------|----------------|
| Mental health / empatia | Cuidado familiar colaborativo — mesma paleta orgânica transmite calma e confiança |
| Logotipo custom "freud" | Sem exceção tipográfica; logo Ours TBD (usar wordmark Urbanist 700) |
| Wave Tab Bar com botão + central | **Manter na spec** — aplicar quando app tiver bottom nav principal (M3+) |
| Sidebar verde escuro (dashboard web) | Opcional em desktop; mobile-first com cream + cards |

## Stack técnica

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Fonte de tokens no runtime | Mantine theme + CSS variables em `globals.css` | Já usamos Mantine; modules importam `ui/` que wrap Mantine |
| Tailwind | `@theme inline` com aliases dos tokens | Coexistência com Mantine sem duplicar hex em modules |
| Font loading | `next/font/google` → Urbanist | Substitui Geist Sans |
| Ícones | Tabler Icons outline, 24px, stroke 2px | Já no ec-v3-ui pattern; alinha spec "flat outline" |
| i18n | Tokens de design são agnósticos de locale | Strings continuam em next-intl |

## Ambiguidades resolvidas

1. **Fundo cream vs branco puro** → Priorizar `bg_cream` (#FCF8F4). Branco só em cards elevados sobre cream.
2. **Textura de pontos decorativa** → `mindful_brown_100` a 3% opacidade; nunca interfere em contraste de texto.
3. **Ícones filled vs outline** → Outline 24px como padrão; filled apenas em tab ativa ou CTA.
4. **Loading spinner** → Circular, cor `serenity_green_60`, não especificado na ref — convenção adotada.
5. **Espaçamento: múltiplos de 8 vs escala [4,8,12...]** → Escala é fonte de verdade; 4px permitido só para micro-ajustes (ícones, borders).

## Agentes de IA (SDD)

Ao criar ou ajustar UI:

1. Ler `.specs/design/DESIGN.md` antes de qualquer componente
2. Mapear cada elemento a um princípio (P01–P07)
3. Usar tokens — nunca hex arbitrário em modules
4. Importar de `@/ui/*`, nunca `@mantine/core` direto
5. Em violações, gerar relatório: elemento, propriedade, valor original, valor corrigido, princípio
