import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import messages from '@/i18n/messages/pt-BR.json';
import { AuthProvider } from '@/presentation/providers/auth';
import { FamilyProvider } from '@/presentation/providers/family';

export function renderWithProviders(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="pt-BR" messages={messages}>
        <MantineProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <FamilyProvider>{children}</FamilyProvider>
            </AuthProvider>
          </QueryClientProvider>
        </MantineProvider>
      </NextIntlClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
