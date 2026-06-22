import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
};

const SHEET_ANIMATION_MS = 280;
const BACKDROP_FADE_MS = 150;

export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel = 'Painel',
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetTranslateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(1);
      sheetTranslateY.setValue(400);
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: SHEET_ANIMATION_MS,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: SHEET_ANIMATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: BACKDROP_FADE_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY, visible]);

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          className="absolute inset-0"
          onPress={onClose}
        />
        <Animated.View
          style={{ transform: [{ translateY: sheetTranslateY }] }}
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
        </Animated.View>
      </View>
    </Modal>
  );
}
