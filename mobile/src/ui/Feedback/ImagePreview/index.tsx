import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/presentation/hooks/use-translation';

export type ImagePreviewProps = {
  visible: boolean;
  uri: string;
  onClose: () => void;
  accessibilityLabel?: string;
};

export function ImagePreview({ visible, uri, onClose, accessibilityLabel }: ImagePreviewProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (!uri) {
    return null;
  }

  const photoLabel = accessibilityLabel ?? t('imagePreview.photoAccessibility');

  return (
    <Modal
      accessibilityViewIsModal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-black/95">
        <Pressable
          accessibilityLabel={t('imagePreview.close')}
          accessibilityRole="button"
          className="absolute right-4 z-10 rounded-full bg-white/20 px-4 py-2"
          style={{ top: insets.top + 8 }}
          onPress={onClose}
        >
          <Text className="font-sans-semibold text-light">{t('common.close')}</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={t('imagePreview.close')}
          accessibilityRole="button"
          className="flex-1 items-center justify-center"
          onPress={onClose}
        >
          <Image
            accessibilityLabel={photoLabel}
            contentFit="contain"
            source={{ uri }}
            style={styles.image}
          />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%',
  },
});
