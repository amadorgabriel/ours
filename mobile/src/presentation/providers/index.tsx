import type { ReactNode } from 'react';

import { AssistidoProvider } from './assistido';
import { AuthProvider } from './auth';
import { SessionBootstrap } from './auth/session-bootstrap';
import { FamilyProvider } from './family';
import { QueryProvider } from './query';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <FamilyProvider>
          <SessionBootstrap>
            <AssistidoProvider>{children}</AssistidoProvider>
          </SessionBootstrap>
        </FamilyProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
