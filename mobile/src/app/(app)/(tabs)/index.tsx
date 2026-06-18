import { Text, View } from 'react-native';

import { useAuth } from '@/presentation/providers/auth';

export default function HomeScreen() {
  const { session } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Text className="font-sans-semibold text-xl text-mindful-brown">
        Olá, {session?.user.name ?? 'cuidador'}
      </Text>
      <Text className="mt-2 font-sans text-mindful-brown/80">Feed — em breve</Text>
    </View>
  );
}
