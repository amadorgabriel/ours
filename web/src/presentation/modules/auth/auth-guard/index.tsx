'use client';

import { useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { Text } from '@/ui/DataDisplay/Text';
import { Container } from '@/ui/Layout/Container';

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
      <Container className="flex flex-1 items-center justify-center py-16" size="sm">
        <Text c="dimmed">{t('loading')}</Text>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
