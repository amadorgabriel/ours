'use client';

import type { ReactNode } from 'react';

import { GuestGuard } from '@/presentation/modules/auth/guest-guard';

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
