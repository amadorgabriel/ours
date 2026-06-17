import { Text, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Bem-vindo</Text>
      <Text className="mt-2 text-center font-sans text-mindful-brown/80">
        Criar família ou entrar com código — próximo PR
      </Text>
    </View>
  );
}
