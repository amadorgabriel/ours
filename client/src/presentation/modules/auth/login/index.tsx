'use client';

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { isGoogleOAuthConfigured } from '@/core/infra/auth/google-oauth-config';
import { applyActiveFamilyFromSession } from '@/core/services/usecases/auth/apply-active-family';
import { useLoginWithGoogle } from '@/core/services/usecases/auth/index.hooks';
import { resolvePostLoginRoute } from '@/core/services/usecases/auth/resolve-post-login-route';
import { useRouter } from '@/i18n/navigation';
import { useFamily } from '@/presentation/providers/family';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Container } from '@/ui/Layout/Container';
import { Stack } from '@/ui/Layout/Stack';

export function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const { setFamilyId } = useFamily();
  const loginMutation = useLoginWithGoogle();
  const [hasError, setHasError] = useState(false);
  const isOAuthConfigured = isGoogleOAuthConfigured();

  function handleGoogleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      setHasError(true);
      return;
    }

    setHasError(false);
    loginMutation.mutate(
      { idToken: response.credential },
      {
        onSuccess: (session) => {
          applyActiveFamilyFromSession(session, setFamilyId);
          router.replace(resolvePostLoginRoute(session.familyCount));
        },
        onError: () => {
          setHasError(true);
        },
      }
    );
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
      <Stack gap="lg" align="stretch">
        <Title order={1}>{t('title')}</Title>
        <Text size="lg" c="dimmed">
          {t('subtitle')}
        </Text>

        {!isOAuthConfigured ? (
          <Text c="red" size="sm">
            {t('missingClientId')}
          </Text>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setHasError(true)}
            text="signin_with"
            useOneTap={false}
          />
        )}

        {(hasError || loginMutation.isError) && (
          <Text c="red" size="sm">
            {t('error')}
          </Text>
        )}
      </Stack>
    </Container>
  );
}
