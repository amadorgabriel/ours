import { Redirect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/presentation/providers/auth';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';

export default function JoinDeepLinkScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { isAuthenticated } = useAuth();
  const inviteCode = typeof code === 'string' ? code.trim().toUpperCase() : '';

  if (!inviteCode) {
    return <Redirect href={mobileRoutes.login} />;
  }

  if (!isAuthenticated) {
    return <Redirect href={`/(auth)/login?invite=${inviteCode}`} />;
  }

  return <Redirect href={`/(auth)/onboarding?invite=${inviteCode}`} />;
}
