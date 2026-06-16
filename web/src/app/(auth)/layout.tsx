'use client';

import type { ReactNode } from 'react';

import { GuestGuard } from '@/presentation/modules/auth/guest-guard';
import { AuthLayout } from '@/presentation/layouts/auth-layout';

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
