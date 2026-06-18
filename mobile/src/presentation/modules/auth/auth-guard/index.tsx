import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '@/presentation/providers/auth';

import { getAuthGuardRedirect } from '../auth-redirect';
import { colors } from '@/presentation/styles/tokens';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isSessionLoading } = useAuth();
  const router = useRouter();

  const redirectTo = getAuthGuardRedirect(isSessionLoading, isAuthenticated);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo as Href);
    }
  }, [redirectTo, router]);

  if (isSessionLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.serenityGreen60} />
        <Text className="mt-2 text-mindful-brown">Carregando sessão…</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
