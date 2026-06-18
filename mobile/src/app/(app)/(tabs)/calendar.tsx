import { Text, View } from 'react-native';

export default function CalendarScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-cream px-6">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Calendário</Text>
      <Text className="mt-2 font-sans text-mindful-brown/80">Em breve</Text>
    </View>
  );
}
