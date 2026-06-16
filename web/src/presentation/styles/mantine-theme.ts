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
      '#F2F5EB',
      '#E5EAD7',
      '#CFD9B5',
      '#B4C48D',
      '#9BB06B',
      '#7D944D',
      designTokens.colors.serenityGreen,
      '#48552D',
      '#384224',
      designTokens.colors.bgDarkGreen,
    ],
    brown: [
      '#F7F4F2',
      '#E8DDD9',
      '#D6C2B8',
      '#C0A091',
      '#AC836C',
      '#926247',
      designTokens.colors.mindfulBrown,
      '#564736',
      '#44382B',
      designTokens.colors.textDarkBrown,
    ],
    orange: [
      '#FFEEE2',
      '#FFC89E',
      '#F6A360',
      designTokens.colors.actionOrangeVivid,
      designTokens.colors.actionOrange,
      '#C96100',
      '#AA5500',
      '#894700',
      '#663600',
      '#43250D',
    ],
    blue: [
      '#E8F0F8',
      '#C5D9EC',
      '#9BBFDB',
      '#6A9FC4',
      '#4A7FA8',
      '#3A6F96',
      designTokens.colors.trustBlue,
      '#234A6E',
      '#1A3854',
      '#16213E',
    ],
    violet: [
      '#F6F1FF',
      '#DDD3FF',
      '#C2B1FF',
      '#A694F5',
      '#897BE3',
      '#6C5FCB',
      designTokens.colors.kindPurple,
      '#3C357C',
      '#292350',
      '#161324',
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
    bgDeep: designTokens.colors.bgDeep,
    bgSurfaceDark: designTokens.colors.bgSurfaceDark,
    textDarkBrown: designTokens.colors.textDarkBrown,
    textLight: designTokens.colors.textLight,
    trustBlue: designTokens.colors.trustBlue,
    kindPurple: designTokens.colors.kindPurple,
    actionOrange: designTokens.colors.actionOrange,
    glassLight: designTokens.glass.light,
    glassDark: designTokens.glass.dark,
    shadowMedium: designTokens.shadows.medium,
    shadowDark: designTokens.shadows.dark,
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
        centered: true,
      },
      styles: {
        content: {
          boxShadow: designTokens.shadows.dark,
          backgroundColor: designTokens.glass.dark.background,
          backdropFilter: `blur(${designTokens.glass.dark.blur})`,
          border: designTokens.glass.dark.border,
        },
        overlay: {
          backgroundColor: 'rgba(30, 36, 51, 0.65)',
        },
        header: {
          backgroundColor: 'transparent',
        },
        title: {
          color: designTokens.colors.textLight,
          fontWeight: 600,
        },
        close: {
          color: 'rgba(255, 255, 255, 0.85)',
        },
      },
    },
    Container: {
      defaultProps: {
        size: 'lg',
      },
    },
  },
});
