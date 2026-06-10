/**
 * Design tokens — Project Ours
 * @see .specs/design/DESIGN.md
 */
export const designTokens = {
  colors: {
    mindfulBrown: '#6B5843',
    serenityGreen: '#5A6838',
    empathyOrange: '#C86900',
    bgCream: '#FCF8F4',
    bgDarkGreen: '#2D3E26',
    bgOrange: '#F6852D',
    textDarkBrown: '#2E1E12',
    textLight: '#FFFFFF',
    textGray: '#6B6B6B',
    success: '#9BB068',
    warning: '#D7A300',
    error: '#C86900',
    info: '#6B5843',
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
  },
  motion: {
    durationFast: '150ms',
    durationBase: '250ms',
    durationSlow: '400ms',
    easingStandard: 'cubic-bezier(0.2, 0, 0, 1)',
    easingDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;
