import { Pressable, Text, View } from 'react-native';

import { useTranslation } from '@/presentation/hooks/use-translation';

type QueryErrorStateProps = {
  message?: string;
  onRetry: () => void;
  variant?: 'default' | 'inline';
};

export function QueryErrorState({
  message,
  onRetry,
  variant = 'default',
}: QueryErrorStateProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t('common.genericLoadError');
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
            ? 'font-sans text-sm text-mindful-brown/80'
            : 'text-center font-sans-semibold text-base text-mindful-brown'
        }
      >
        {displayMessage}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.retry')}
        className={`items-center rounded-xl border border-serenity-green px-6 py-3 ${isInline ? 'mt-4' : 'mt-6'}`}
        onPress={onRetry}
      >
        <Text className="font-sans-semibold text-serenity-green">{t('common.retry')}</Text>
      </Pressable>
    </View>
  );
}
