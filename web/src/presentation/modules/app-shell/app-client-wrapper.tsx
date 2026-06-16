'use client';

import type { ReactNode } from 'react';

import { AuthGuard } from '@/presentation/modules/auth/auth-guard';

import { AppShell } from './index';

type AppClientWrapperProps = {
  children: ReactNode;
};

export function AppClientWrapper({ children }: AppClientWrapperProps) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
