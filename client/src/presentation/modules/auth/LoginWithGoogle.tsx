'use client';

import { Stack, Text, Title } from '@mantine/core';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { fetchAntiforgeryToken, postGoogleLogin } from '@/core/services/auth/authService';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function LoginWithGoogle() {
  const t = useTranslations('login');
  const router = useRouter();
  const [antiforgeryToken, setAntiforgeryToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await fetchAntiforgeryToken();
        if (!cancelled) {
          setAntiforgeryToken(token);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : t('antiforgeryError'));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  if (!clientId) {
    return (
      <Stack gap="md">
        <Title order={2}>{t('title')}</Title>
        <Text c="red">{t('missingClientId')}</Text>
      </Stack>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Stack gap="md" align="stretch">
        <Title order={2}>{t('title')}</Title>
        {loadError ? <Text c="red">{loadError}</Text> : null}
        {!antiforgeryToken && !loadError ? <Text size="sm">{t('preparing')}</Text> : null}
        {antiforgeryToken && !loadError ? (
          <GoogleLogin
            text="continue_with"
            shape="rectangular"
            useOneTap={false}
            onSuccess={async (credentialResponse) => {
              const cred = credentialResponse.credential;
              if (!cred || busy) {
                return;
              }
              setBusy(true);
              try {
                await postGoogleLogin(cred, antiforgeryToken);
                router.push('/welcome');
              } catch (e) {
                setLoadError(e instanceof Error ? e.message : t('loginFailed'));
              } finally {
                setBusy(false);
              }
            }}
            onError={() => setLoadError(t('googleUiError'))}
          />
        ) : null}
      </Stack>
    </GoogleOAuthProvider>
  );
}
