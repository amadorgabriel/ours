import { Modal, Pressable, Text, View } from 'react-native';

export type ConfirmDialogButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  accessibilityLabel?: string;
  onPress?: () => void;
};

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: ConfirmDialogButton[];
  onRequestClose: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  buttons,
  onRequestClose,
}: ConfirmDialogProps) {
  if (!visible) {
    return null;
  }

  const cancelButton = buttons.find((button) => button.style === 'cancel');
  const actionButtons = buttons.filter((button) => button.style !== 'cancel');

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 bg-black/40">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          className="absolute inset-0"
          onPress={onRequestClose}
        />
        <View className="flex-1 items-center justify-center px-6" pointerEvents="box-none">
          <View className="w-full max-w-sm rounded-2xl bg-cream p-6">
            <Text className="font-sans-semibold text-lg text-mindful-brown">{title}</Text>
            {message ? (
              <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{message}</Text>
            ) : null}

            <View className="mt-6 flex-row gap-3">
              {cancelButton ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={cancelButton.accessibilityLabel ?? cancelButton.text}
                  className="min-h-12 flex-1 items-center justify-center rounded-full border border-mindful-brown/30 px-4"
                  onPress={() => {
                    cancelButton.onPress?.();
                    onRequestClose();
                  }}
                >
                  <Text className="font-sans-semibold text-mindful-brown">{cancelButton.text}</Text>
                </Pressable>
              ) : null}
              {actionButtons.map((button, index) => (
                <Pressable
                  key={`${button.style ?? 'default'}-${button.text}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={button.accessibilityLabel ?? button.text}
                  className={`min-h-12 flex-1 items-center justify-center rounded-full px-4 ${
                    button.style === 'destructive'
                      ? 'border border-red-600'
                      : 'bg-serenity-green'
                  }`}
                  onPress={() => {
                    button.onPress?.();
                    onRequestClose();
                  }}
                >
                  <Text
                    className={`font-sans-semibold ${
                      button.style === 'destructive' ? 'text-red-600' : 'text-light'
                    }`}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
