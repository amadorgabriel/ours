import type { ReactNode } from 'react';

import { AlertProvider } from './alert';
import { AssistidoProvider } from './assistido';
import { AuthProvider } from './auth';
import { SessionBootstrap } from './auth/session-bootstrap';
import { FamilyProvider } from './family';
import { NotificationProvider } from './notifications';
import { QueryProvider } from './query';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <FamilyProvider>
          <SessionBootstrap>
            <NotificationProvider>
              <AssistidoProvider>
                <AlertProvider>{children}</AlertProvider>
              </AssistidoProvider>
            </NotificationProvider>
          </SessionBootstrap>
        </FamilyProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
