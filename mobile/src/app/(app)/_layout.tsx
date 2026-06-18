import { Stack } from 'expo-router';

import { AuthGuard } from '@/presentation/modules/auth/auth-guard';

export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FCF8F4' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="families/select" />
      </Stack>
    </AuthGuard>
  );
}
