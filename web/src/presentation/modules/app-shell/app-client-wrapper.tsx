'use client';

import type { ReactNode } from 'react';

import { usePathname } from '@/i18n/navigation';
import { isMinimalShellRoute } from '@/i18n/routes';
import { AuthGuard } from '@/presentation/modules/auth/auth-guard';

import { AppShell } from './index';
import { MinimalShell } from './minimal-shell';

type AppClientWrapperProps = {
  children: ReactNode;
};

export function AppClientWrapper({ children }: AppClientWrapperProps) {
  const pathname = usePathname();
  const minimal = isMinimalShellRoute(pathname);

  return (
    <AuthGuard>
      {minimal ? <MinimalShell>{children}</MinimalShell> : <AppShell>{children}</AppShell>}
    </AuthGuard>
  );
}
