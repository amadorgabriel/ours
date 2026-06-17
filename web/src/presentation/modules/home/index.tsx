'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { Text } from '@/ui/DataDisplay/Text';
import { Container } from '@/ui/Layout/Container';

import { getHomeRedirect } from '../auth/auth-redirect';

export function HomePage() {
  const { isAuthenticated, isSessionLoading, session } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth.session');
  const [navError, setNavError] = useState(false);

  const redirectTo = getHomeRedirect(
    isSessionLoading,
    isAuthenticated,
    session?.familyCount
  );

  useEffect(() => {
    if (!redirectTo) {
      return;
    }

    void (async () => {
      try {
        router.replace(redirectTo);
      } catch (error) {
        console.error('Navigation failed:', error);
        setNavError(true);

        try {
          router.push(redirectTo);
        } catch (pushError) {
          console.error('Fallback navigation failed:', pushError);
        }
      }
    })();
  }, [redirectTo, router]);

  return (
    <Container className="flex flex-1 items-center justify-center py-16" size="sm">
      {navError ? (
        <Text c="red">{t('navigationError')}</Text>
      ) : (
        <Text c="dimmed">{t('loading')}</Text>
      )}
    </Container>
  );
}
