import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';

import { useEffect, useState } from 'react';

import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getGoogleIosClientId,
  getGoogleWebClientId,
  isGoogleSignInConfigured,
} from '@/core/infra/auth/google-signin-config';

import { prepareGoogleSignInForAccountPicker } from '@/core/infra/auth/google-signin-session';

import { t } from '@/core/infra/i18n';

import { HttpClientError } from '@/core/infra/http/http-error';

import { applyActiveFamilyFromSession } from '@/core/services/usecases/auth/apply-active-family';

import { useLoginWithGoogle } from '@/core/services/usecases/auth/index.hooks';

import { resolvePostLoginRoute } from '@/presentation/modules/auth/auth-redirect';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';

import { useFamily } from '@/presentation/providers/family';

function getLoginErrorDetail(error: unknown): string {
  if (error instanceof HttpClientError) {
    const payload = error.data as { message?: string } | undefined;

    if (error.statusCode) {
      return t('auth.apiError', {
        status: error.statusCode,
        message: payload?.message ?? error.message,
      });
    }

    return error.message;
  }

  if (isErrorWithCode(error)) {
    if (error.code === '10') {
      return t('auth.googleDeveloperError');
    }
    return t('auth.googleError', { code: error.code });
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t('auth.unknownError');
}

export function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { setFamilyId } = useFamily();

  const loginMutation = useLoginWithGoogle();

  const [hasError, setHasError] = useState(false);

  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const isConfigured = isGoogleSignInConfigured();

  useEffect(() => {
    if (!isConfigured) return;

    GoogleSignin.configure({
      webClientId: getGoogleWebClientId(),

      iosClientId: getGoogleIosClientId(),

      offlineAccess: false,
    });
  }, [isConfigured]);

  function reportError(error: unknown, fallback = t('auth.signInFailed')) {
    console.error('[Login]', error);

    setHasError(true);

    setErrorDetail(__DEV__ ? getLoginErrorDetail(error) : fallback);
  }

  async function handleGoogleSignIn() {
    setHasError(false);

    setErrorDetail(null);

    try {
      await GoogleSignin.hasPlayServices();

      await prepareGoogleSignInForAccountPicker();

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        return;
      }

      loginMutation.mutate(
        { idToken: response.data.idToken },

        {
          onSuccess: (session) => {
            applyActiveFamilyFromSession(session, setFamilyId);

            router.replace(resolvePostLoginRoute(session.familyCount) as Href);
          },

          onError: (error) => reportError(error),
        }
      );
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      reportError(error);
    }
  }

  return (
    <View
      className="flex-1 bg-cream px-8"
      style={{
        paddingBottom: insets.bottom + 32,
        paddingTop: insets.top + 48,
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Image
          accessibilityLabel={t('auth.logoAccessibility')}
          resizeMode="contain"
          source={require('@/assets/images/logo-ours.png')}
          style={{ height: 88, width: 88 }}
        />

        <Text className="mt-8 font-sans-semibold text-4xl text-mindful-brown">{t('auth.appName')}</Text>

        <Text className="mt-3 max-w-xs text-center font-sans text-base leading-6 text-mindful-brown/70">
          {t('auth.tagline')}
        </Text>

        <View className="mt-10 h-px w-16 bg-serenity-green/30" />
      </View>

      <View className="w-full max-w-[320px] self-center">
        <Text className="mb-6 text-center font-sans text-sm leading-5 text-mindful-brown/60">
          {t('auth.loginFooterNote')}
        </Text>

        {!isConfigured ? (
          <Text className="text-center font-sans text-sm text-red-600">
            {t('auth.googleNotConfigured')}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-serenity-green py-3.5"
            disabled={loginMutation.isPending}
            onPress={() => void handleGoogleSignIn()}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Ionicons color={colors.textLight} name="logo-google" size={20} />
                <Text className="font-sans-semibold text-light">{t('auth.signInGoogle')}</Text>
              </>
            )}
          </Pressable>
        )}

        {(hasError || loginMutation.isError) && (
          <Text className="mt-3 text-center font-sans text-sm text-red-600">
            {errorDetail ?? t('auth.signInFailed')}
          </Text>
        )}

        <Text className="mt-6 text-center font-sans text-xs leading-4 text-mindful-brown/45">
          {t('auth.privacyNote')}
        </Text>
      </View>
    </View>
  );
}
