import { Redirect, type Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { getHomeRedirect } from '@/presentation/modules/auth/auth-redirect';
import { useAuth } from '@/presentation/providers/auth';

export default function Index() {
  const { isAuthenticated, isSessionLoading, session } = useAuth();

  const redirectTo = getHomeRedirect(isSessionLoading, isAuthenticated, session?.familyCount);

  if (redirectTo === null) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#5A6838" />
      </View>
    );
  }

  return <Redirect href={redirectTo as Href} />;
}
