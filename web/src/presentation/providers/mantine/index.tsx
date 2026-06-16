'use client';

import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

import { mantineTheme } from '@/presentation/styles/mantine-theme';

export function MantineProviderRoot({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
