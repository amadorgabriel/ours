import type { ReactNode } from 'react';

import { AssistidoProvider } from './assistido';
import { AuthProvider } from './auth';
import { FamilyProvider } from './family';
import { QueryProvider } from './query';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <FamilyProvider>
          <AssistidoProvider>{children}</AssistidoProvider>
        </FamilyProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
