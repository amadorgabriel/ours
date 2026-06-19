import { Pressable, Text, View } from 'react-native';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'inline';
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const isInline = variant === 'inline';

  return (
    <View
      className={
        isInline
          ? 'rounded-xl bg-white/80 p-4'
          : 'flex-1 items-center justify-center px-6 py-16'
      }
    >
      <Text
        className={
          isInline
            ? 'font-sans text-sm text-mindful-brown/70'
            : 'font-sans-semibold text-lg text-mindful-brown'
        }
      >
        {title}
      </Text>
      {description ? (
        <Text
          className={
            isInline
              ? 'mt-1 font-sans text-sm text-mindful-brown/70'
              : 'mt-2 text-center font-sans text-sm text-mindful-brown/70'
          }
        >
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          className={`items-center rounded-xl bg-serenity-green px-6 py-3 ${isInline ? 'mt-4' : 'mt-6'}`}
          onPress={onAction}
        >
          <Text className="font-sans-semibold text-light">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
