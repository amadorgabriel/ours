import { Stack } from 'expo-router';

import { GuestGuard } from '@/presentation/modules/auth/guest-guard';
import { colors } from '@/presentation/styles/tokens';

export default function AuthLayout() {
  return (
    <GuestGuard>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgCream } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </GuestGuard>
  );
}
