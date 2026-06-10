import { createTheme } from '@mantine/core';

import { designTokens } from './design-tokens';

const urbanistStack =
  'var(--font-urbanist), Outfit, Poppins, ui-sans-serif, system-ui, sans-serif';

export const mantineTheme = createTheme({
  primaryColor: 'green',
  primaryShade: 6,
  defaultRadius: 'md',
  cursorType: 'pointer',
  fontFamily: urbanistStack,
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, monospace',
  headings: {
    fontFamily: urbanistStack,
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '32px', lineHeight: '1.2', fontWeight: '700' },
      h2: { fontSize: '28px', lineHeight: '1.3', fontWeight: '600' },
      h3: { fontSize: '24px', lineHeight: '1.4', fontWeight: '600' },
      h4: { fontSize: '20px', lineHeight: '1.4', fontWeight: '500' },
      h5: { fontSize: '18px', lineHeight: '1.5', fontWeight: '500' },
      h6: { fontSize: '16px', lineHeight: '1.5', fontWeight: '500' },
    },
  },
  radius: {
    xs: '4px',
    sm: `${designTokens.radius.sm}px`,
    md: `${designTokens.radius.md}px`,
    lg: `${designTokens.radius.lg}px`,
    xl: `${designTokens.radius.xl}px`,
  },
  colors: {
    green: [
      '#F4F7EF',
      '#E5EDDA',
      '#D0DDBF',
      '#B8C99E',
      '#9BB068',
      '#6F7D48',
      designTokens.colors.serenityGreen,
      '#48552D',
      '#384224',
      designTokens.colors.bgDarkGreen,
    ],
    brown: [
      '#F5F2EE',
      '#E8E2DA',
      '#D5CBC0',
      '#BEB0A0',
      '#A39482',
      '#857262',
      designTokens.colors.mindfulBrown,
      '#564736',
      '#44382B',
      designTokens.colors.textDarkBrown,
    ],
    orange: [
      '#FFF4E8',
      '#FFE4CC',
      '#FFD0A3',
      '#FFB870',
      designTokens.colors.bgOrange,
      '#D97A00',
      designTokens.colors.empathyOrange,
      '#A05500',
      '#7D4200',
      '#5C3000',
    ],
    darkGreen: [
      '#E8EDE6',
      '#CDD8C8',
      '#A8B89E',
      '#829870',
      '#627A52',
      '#4A5F3C',
      designTokens.colors.bgDarkGreen,
      '#243220',
      '#1C2719',
      '#141D12',
    ],
  },
  other: {
    bgCream: designTokens.colors.bgCream,
    textDarkBrown: designTokens.colors.textDarkBrown,
    textLight: designTokens.colors.textLight,
    shadowMedium: designTokens.shadows.medium,
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        input: {
          paddingInline: `${designTokens.spacing[3]}px`,
          paddingBlock: `${designTokens.spacing[3]}px`,
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        content: {
          boxShadow: designTokens.shadows.medium,
        },
      },
    },
    Container: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});
