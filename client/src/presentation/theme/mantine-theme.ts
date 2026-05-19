import { createTheme } from '@mantine/core';

export const mantineTheme = createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 7 },
  defaultRadius: 'md',
  cursorType: 'pointer',
  fontFamily:
    'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  fontFamilyMonospace: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace',
  headings: {
    fontWeight: '600',
    fontFamily:
      'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  colors: {
    gray: [
      '#f8f9fa',
      '#f1f3f5',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#868e96',
      '#495057',
      '#343a40',
      '#212529',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Container: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});
