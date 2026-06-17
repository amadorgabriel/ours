import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  getGoogleIosClientId,
  getGoogleWebClientId,
  isGoogleSignInConfigured,
} from '@/core/infra/auth/google-signin-config';
import { applyActiveFamilyFromSession } from '@/core/services/usecases/auth/apply-active-family';
import { useLoginWithGoogle } from '@/core/services/usecases/auth/index.hooks';
import { resolvePostLoginRoute } from '@/presentation/modules/auth/auth-redirect';
import { useFamily } from '@/presentation/providers/family';

export function LoginScreen() {
  const router = useRouter();
  const { setFamilyId } = useFamily();
  const loginMutation = useLoginWithGoogle();
  const [hasError, setHasError] = useState(false);
  const isConfigured = isGoogleSignInConfigured();

  useEffect(() => {
    if (!isConfigured) return;

    GoogleSignin.configure({
      webClientId: getGoogleWebClientId(),
      iosClientId: getGoogleIosClientId(),
      offlineAccess: false,
    });
  }, [isConfigured]);

  async function handleGoogleSignIn() {
    setHasError(false);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        setHasError(true);
        return;
      }

      loginMutation.mutate(
        { idToken: response.data.idToken },
        {
          onSuccess: (session) => {
            applyActiveFamilyFromSession(session, setFamilyId);
            router.replace(resolvePostLoginRoute(session.familyCount) as Href);
          },
          onError: () => setHasError(true),
        }
      );
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      setHasError(true);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Text className="font-sans-semibold text-2xl text-mindful-brown">Project Ours</Text>
      <Text className="mt-2 text-center font-sans text-base text-mindful-brown/80">
        Cuidado colaborativo entre irmãos
      </Text>

      <View className="mt-10 w-full max-w-xs">
        {!isConfigured ? (
          <Text className="text-center font-sans text-sm text-red-600">
            Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID em .env.local
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            className="items-center rounded-xl bg-serenity-green py-3"
            disabled={loginMutation.isPending}
            onPress={() => void handleGoogleSignIn()}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#FCF8F4" />
            ) : (
              <Text className="font-sans-semibold text-light">Entrar com Google</Text>
            )}
          </Pressable>
        )}

        {(hasError || loginMutation.isError) && (
          <Text className="mt-3 text-center font-sans text-sm text-red-600">
            Não foi possível entrar. Tente novamente.
          </Text>
        )}
      </View>
    </View>
  );
}
