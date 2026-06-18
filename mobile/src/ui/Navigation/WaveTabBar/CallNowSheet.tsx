import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CallNowSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CallNowSheet({ visible, onClose }: CallNowSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable accessibilityRole="button" className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-cream px-6 pt-6"
          style={{ paddingBottom: insets.bottom + 24 }}
          onPress={(event) => event.stopPropagation()}
        >
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
