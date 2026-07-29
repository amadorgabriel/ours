'use client';

import type { ReactNode } from 'react';

import { AuthProvider } from './auth';
import { SessionBootstrap } from './auth/session-bootstrap';
import { FamilyProvider } from './family';
import { GoogleOAuthProviderRoot } from './google-oauth';
import { MantineProviderRoot } from './mantine';
import { QueryProvider } from './query';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <GoogleOAuthProviderRoot>
        <AuthProvider>
          <FamilyProvider>
            <SessionBootstrap>
              <MantineProviderRoot>{children}</MantineProviderRoot>
            </SessionBootstrap>
          </FamilyProvider>
        </AuthProvider>
      </GoogleOAuthProviderRoot>
    </QueryProvider>
  );
}
