'use client';

import { Button, Center, Loader, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBrandGoogleFilled, IconHeartHandshake } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { resolvePostLoginRoute } from '@/core/domain/auth/types';
import { fetchAntiforgeryToken, postGoogleLogin } from '@/core/services/auth/authService';
import { useRouter } from '@/i18n/navigation';

// Tipo para a API do Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: {
            isDisplayMoment: () => boolean;
            isDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getMomentType: () => string;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'continue_with' | 'signup_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export function LoginWithGoogle() {
  const t = useTranslations('login');
  const router = useRouter();
  const [antiforgeryToken, setAntiforgeryToken] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  // Busca token antiforgery ao montar
  useEffect(() => {
    let cancelled = false;

    async function init() {
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
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      if (!antiforgeryToken) {
        setLoadError(t('antiforgeryError'));
        return;
      }

      setIsLoggingIn(true);
      try {
        const authResponse = await postGoogleLogin(credential, antiforgeryToken);
        const destination = resolvePostLoginRoute(authResponse);
        router.push(destination);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : t('loginFailed'));
        setIsLoggingIn(false);
      }
    },
    [antiforgeryToken, router, t],
  );

  useEffect(() => {
    if (!clientId || typeof window === 'undefined' || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        void handleGoogleCredential(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });
  }, [clientId, handleGoogleCredential]);

  // Trigger login Google
  const handleLoginClick = () => {
    if (!window.google || !clientId) {
      setLoadError(t('missingClientId'));
      return;
    }
    if (!antiforgeryToken) {
      setLoadError(t('antiforgeryError'));
      return;
    }

    window.google.accounts.id.prompt();
  };

  const isLoading = !antiforgeryToken && !loadError;
  const isReady = !!antiforgeryToken && !!clientId && !isLoggingIn;

  if (!clientId) {
    return (
      <Stack gap="md" align="center">
        <Title order={2}>{t('title')}</Title>
        <Text c="red" size="sm" ta="center">
          {t('missingClientId')}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" align="center" w="100%">
      {/* Logo e ícone */}
      <Center>
        <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
          <IconHeartHandshake size={32} />
        </ThemeIcon>
      </Center>

      {/* Título e tagline */}
      <Stack gap="xs" align="center">
        <Title order={1} size="h2" ta="center">
          {t('title')}
        </Title>
        <Text c="dimmed" size="md" ta="center">
          {t('tagline')}
        </Text>
      </Stack>

      {/* Estados */}
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
          <Text size="sm" c="dimmed" ml="xs">
            {t('preparing')}
          </Text>
        </Center>
      )}

      {loadError && !isLoading && (
        <Text c="red" size="sm" ta="center" role="alert" aria-live="assertive">
          {loadError}
        </Text>
      )}

      {/* Botão Google Custom - full-width, 48px height */}
      <Button
        size="lg"
        fullWidth
        leftSection={<IconBrandGoogleFilled size={20} />}
        onClick={handleLoginClick}
        disabled={!isReady}
        loading={isLoggingIn}
        radius="md"
        styles={{
          root: {
            height: 48,
          },
        }}
        aria-busy={isLoggingIn}
        aria-live="polite"
      >
        {t('ctaGoogle')}
      </Button>

      {/* Footer links */}
      <Text size="xs" c="dimmed" ta="center">
        <a href="#" className="underline hover:text-gray-600">
          {t('footer.terms')}
        </a>{' '}
        {t('footer.separator')}{' '}
        <a href="#" className="underline hover:text-gray-600">
          {t('footer.privacy')}
        </a>
      </Text>
    </Stack>
  );
}
