import { Stack } from 'expo-router';

import { colors } from '@/presentation/styles/tokens';
import { AuthGuard } from '@/presentation/modules/auth/auth-guard';

export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgCream } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="families/select" />
      </Stack>
    </AuthGuard>
  );
}
