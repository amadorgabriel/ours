/**
 * Design tokens — Project Ours
 * @see .specs/design/DESIGN.md v1.2.0
 */
export const designTokens = {
  colors: {
    // Estrutura / conteúdo
    mindfulBrown: '#6B5843',
    textDarkBrown: '#2E1E12',
    textMuted: '#928D86',

    // Ação primária
    serenityGreen: '#5A6838',
    bgDarkGreen: '#2D3E26',

    // Confiança / comunicação
    trustBlue: '#2B5F8A',

    // Apoio / destaque especial
    kindPurple: '#5349A5',

    // Alerta / urgência controlada
    actionOrange: '#E87A2D',
    actionOrangeVivid: '#ED7E1C',

    // Fundos
    bgCream: '#FCF8F4',
    bgDeep: '#1E2433',
    bgDeepAlt: '#1C1C1E',
    bgSurfaceDark: '#2A3142',

    // Texto
    textLight: '#FFFFFF',
    textOnDeep: '#F5F5F5',

    // Semânticas
    success: '#9BB06B',
    warning: '#D7A300',
    error: '#E87A2D',
    info: '#2B5F8A',
  },
  glass: {
    light: {
      background: 'rgba(252, 248, 244, 0.72)',
      blur: '12px',
      border: '1px solid rgba(107, 88, 67, 0.08)',
    },
    dark: {
      background: 'rgba(42, 49, 66, 0.75)',
      blur: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80] as const,
  shadows: {
    low: '0 2px 8px rgba(0,0,0,0.06)',
    medium: '0 4px 16px rgba(0,0,0,0.10)',
    high: '0 8px 32px rgba(0,0,0,0.12)',
    dark: '0 8px 32px rgba(0,0,0,0.35)',
  },
  motion: {
    durationFast: '150ms',
    durationBase: '250ms',
    durationSlow: '400ms',
    easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
    easingDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;
