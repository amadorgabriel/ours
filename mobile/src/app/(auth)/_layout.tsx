import { Stack } from 'expo-router';

import { GuestGuard } from '@/presentation/modules/auth/guest-guard';

export default function AuthLayout() {
  return (
    <GuestGuard>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FCF8F4' } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </GuestGuard>
  );
}
