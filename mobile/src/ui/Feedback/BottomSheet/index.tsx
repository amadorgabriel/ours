import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
};

export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel = 'Painel',
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          accessibilityLabel={accessibilityLabel}
          className="rounded-t-3xl bg-cream px-6 pt-3"
          style={{ paddingBottom: insets.bottom + 24 }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-mindful-brown/20" />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
