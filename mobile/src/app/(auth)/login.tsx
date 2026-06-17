import { Text, View } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Text className="font-sans-semibold text-2xl text-mindful-brown">Project Ours</Text>
      <Text className="mt-2 text-center font-sans text-base text-mindful-brown/80">
        Cuidado colaborativo entre irmãos
      </Text>
      <Text className="mt-8 font-sans text-sm text-mindful-brown/60">
        Login Google — próximo PR
      </Text>
    </View>
  );
}
