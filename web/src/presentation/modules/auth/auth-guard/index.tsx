'use client';

import { useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { Text } from '@/ui/DataDisplay/Text';

import { getAuthGuardRedirect } from '../auth-redirect';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isSessionLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth.session');

  const redirectTo = getAuthGuardRedirect(isSessionLoading, isAuthenticated);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  if (isSessionLoading) {
    return (
      <div className="flex min-h-dvh flex-1 items-center justify-center">
        <Text c="dimmed">{t('loading')}</Text>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
