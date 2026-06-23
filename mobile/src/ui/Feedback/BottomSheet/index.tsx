import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/presentation/hooks/use-translation';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
  scrollable?: boolean;
};

const SHEET_ANIMATION_MS = 280;
const BACKDROP_FADE_MS = 150;

export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel,
  scrollable = false,
}: BottomSheetProps) {
  const { t } = useTranslation();
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

  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  const panelLabel = accessibilityLabel ?? t('bottomSheet.panel');
  const closeLabel = t('bottomSheet.close');

  const content = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-black/40"
          style={{ opacity: backdropOpacity }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          className="absolute inset-0"
          onPress={onClose}
        />
        <Animated.View style={{ transform: [{ translateY: sheetTranslateY }] }}>
          <Pressable
            accessibilityLabel={panelLabel}
            className="rounded-t-3xl bg-cream px-6 pt-3"
            style={{ paddingBottom: insets.bottom + 24 }}
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-mindful-brown/20" />
            {content}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
