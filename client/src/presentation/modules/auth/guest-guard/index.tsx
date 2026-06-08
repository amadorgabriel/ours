'use client';

import { useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { Text } from '@/ui/DataDisplay/Text';
import { Container } from '@/ui/Layout/Container';

import { getGuestGuardRedirect } from '../auth-redirect';

type GuestGuardProps = {
  children: ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isSessionLoading, session } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth.session');

  const redirectTo = getGuestGuardRedirect(
    isSessionLoading,
    isAuthenticated,
    session?.familyCount
  );

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

  if (isAuthenticated) {
    return null;
  }

  return children;
}
