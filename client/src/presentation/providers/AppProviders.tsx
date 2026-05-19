'use client';

import { MantineProvider } from '@mantine/core';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { getQueryClient } from '@/core/services/query/queryClient';
import { mantineTheme } from '@/presentation/theme/mantine-theme';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
