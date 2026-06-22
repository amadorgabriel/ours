import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { useRouter, type Href } from "expo-router";

import { useEffect, useState } from "react";

import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import {
  getGoogleIosClientId,
  getGoogleWebClientId,
  isGoogleSignInConfigured,
} from "@/core/infra/auth/google-signin-config";

import { HttpClientError } from "@/core/infra/http/http-error";

import { applyActiveFamilyFromSession } from "@/core/services/usecases/auth/apply-active-family";

import { useLoginWithGoogle } from "@/core/services/usecases/auth/index.hooks";

import { resolvePostLoginRoute } from "@/presentation/modules/auth/auth-redirect";
import { colors } from "@/presentation/styles/tokens";

import { useFamily } from "@/presentation/providers/family";

function getLoginErrorDetail(error: unknown): string {
  if (error instanceof HttpClientError) {
    const payload = error.data as { message?: string } | undefined;

    if (error.statusCode) {
      return `API ${error.statusCode}: ${payload?.message ?? error.message}`;
    }

    return error.message;
  }

  if (isErrorWithCode(error)) {
    // Android Sign-In: código 10 = DEVELOPER_ERROR (não exposto em statusCodes do SDK)
    if (error.code === "10") {
      return "Google (10): SHA-1 ou pacote incorreto no Console — confira credencial Android";
    }
    return `Google (${error.code})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
}

export function LoginScreen() {
  const router = useRouter();

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

  function reportError(
    error: unknown,
    fallback = "Não foi possível entrar. Tente novamente.",
  ) {
    console.error("[Login]", error);

    setHasError(true);

    setErrorDetail(__DEV__ ? getLoginErrorDetail(error) : fallback);
  }

  async function handleGoogleSignIn() {
    setHasError(false);

    setErrorDetail(null);

    try {
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response) || !response.data.idToken) {
        reportError(
          new Error(
            "Google não retornou idToken — confira Web client ID e SHA-1 Android",
          ),
        );

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
        },
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
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Image
        accessibilityLabel="Project Ours"
        className="mb-4"
        resizeMode="contain"
        source={require("@/assets/images/logo-ours.png")}
        style={{ height: 96, width: 96 }}
      />
      <Text className="font-sans-semibold text-2xl text-mindful-brown">
        Project Ours
      </Text>

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
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">
                Entrar com Google
              </Text>
            )}
          </Pressable>
        )}

        {(hasError || loginMutation.isError) && (
          <Text className="mt-3 text-center font-sans text-sm text-red-600">
            {errorDetail ?? "Não foi possível entrar. Tente novamente."}
          </Text>
        )}
      </View>
    </View>
  );
}
