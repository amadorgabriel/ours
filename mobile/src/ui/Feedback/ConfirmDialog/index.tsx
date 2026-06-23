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
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm rounded-2xl bg-cream p-6">
          <Text className="font-sans-semibold text-lg text-mindful-brown">{title}</Text>
          {message ? (
            <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{message}</Text>
          ) : null}

          <View className="mt-6 flex-row justify-end gap-3">
            {cancelButton ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={cancelButton.accessibilityLabel ?? cancelButton.text}
                className="min-h-[44px] items-center justify-center rounded-xl px-4"
                onPress={() => {
                  cancelButton.onPress?.();
                  onRequestClose();
                }}
              >
                <Text className="font-sans-semibold text-mindful-brown">{cancelButton.text}</Text>
              </Pressable>
            ) : null}
            {actionButtons.map((button) => (
              <Pressable
                key={button.text}
                accessibilityRole="button"
                accessibilityLabel={button.accessibilityLabel ?? button.text}
                className="min-h-[44px] items-center justify-center rounded-xl px-4"
                onPress={() => {
                  button.onPress?.();
                  onRequestClose();
                }}
              >
                <Text
                  className={`font-sans-semibold ${
                    button.style === 'destructive' ? 'text-red-600' : 'text-serenity-green'
                  }`}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
