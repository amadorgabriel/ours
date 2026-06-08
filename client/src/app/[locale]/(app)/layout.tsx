'use client';

import type { ReactNode } from 'react';

import { AppShell } from '@/presentation/modules/app-shell';
import { AuthGuard } from '@/presentation/modules/auth/auth-guard';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
