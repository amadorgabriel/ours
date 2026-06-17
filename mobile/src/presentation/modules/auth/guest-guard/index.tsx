import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '@/presentation/providers/auth';

import { getGuestGuardRedirect } from '../auth-redirect';

type GuestGuardProps = {
  children: ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isSessionLoading, session } = useAuth();
  const router = useRouter();

  const redirectTo = getGuestGuardRedirect(
    isSessionLoading,
    isAuthenticated,
    session?.familyCount
  );

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo as Href);
    }
  }, [redirectTo, router]);

  if (isSessionLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#5A6838" />
        <Text className="mt-2 text-mindful-brown">Carregando sessão…</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
