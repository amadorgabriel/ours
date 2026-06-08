'use client';

import type { ReactNode } from 'react';

import { AuthProvider } from './auth';
import { FamilyProvider } from './family';
import { MantineProviderRoot } from './mantine';
import { QueryProvider } from './query';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <FamilyProvider>
          <MantineProviderRoot>{children}</MantineProviderRoot>
        </FamilyProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
