import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useLogout } from '@/core/services/usecases/auth/index.hooks';
import { mobileRoutes } from '@/presentation/modules/auth/auth-redirect';
import { useAuth } from '@/presentation/providers/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const logoutMutation = useLogout();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace(mobileRoutes.login as Href),
    });
  }

  return (
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Text className="font-sans-semibold text-xl text-mindful-brown">
        Olá, {session?.user.name ?? 'cuidador'}
      </Text>
      <Text className="mt-2 font-sans text-mindful-brown/80">Feed — em breve</Text>
      <Pressable
        accessibilityRole="button"
        className="mt-8 rounded-xl border border-mindful-brown/20 px-4 py-2"
        disabled={logoutMutation.isPending}
        onPress={handleLogout}
      >
        <Text className="font-sans text-mindful-brown">Sair</Text>
      </Pressable>
    </View>
  );
}
