import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { hasActiveSession } from '@/core/services/auth/authSession';
import { routing } from '@/i18n/routing';

type AppGroupLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppGroupLayout({ children, params }: AppGroupLayoutProps) {
  const { locale } = await params;

  if (!(await hasActiveSession())) {
    const loginPath = locale === routing.defaultLocale ? '/login' : `/${locale}/login`;
    redirect(loginPath);
  }

  return children;
}
