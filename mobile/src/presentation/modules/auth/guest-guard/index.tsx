import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useAuth } from '@/presentation/providers/auth';
import { useTranslation } from '@/presentation/hooks/use-translation';

import { getGuestGuardRedirect } from '../auth-redirect';
import { colors } from '@/presentation/styles/tokens';

type GuestGuardProps = {
  children: ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const { t } = useTranslation();
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
        <ActivityIndicator color={colors.serenityGreen60} />
        <Text className="mt-2 text-mindful-brown">{t('common.loadingSession')}</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    if (session?.familyCount === 0) {
      return children;
    }
    return null;
  }

  return children;
}
