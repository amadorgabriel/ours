import { Pressable, Text } from 'react-native';

import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type CallNowSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CallNowSheet({ visible, onClose }: CallNowSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Registrar ligação">
      <Text className="font-sans-semibold text-xl text-mindful-brown">Liguei agora</Text>
      <Text className="mt-2 font-sans text-mindful-brown/80">
        Registrar ligação — conteúdo real em M6-S2
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-6 items-center rounded-xl bg-serenity-green py-3"
        onPress={onClose}
      >
        <Text className="font-sans-semibold text-light">Fechar</Text>
      </Pressable>
    </BottomSheet>
  );
}
