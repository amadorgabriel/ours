import { Pressable, Text, View } from 'react-native';

type QueryErrorStateProps = {
  message?: string;
  onRetry: () => void;
  variant?: 'default' | 'inline';
};

export function QueryErrorState({
  message = 'Não foi possível carregar os dados.',
  onRetry,
  variant = 'default',
}: QueryErrorStateProps) {
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
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tentar novamente"
        className={`items-center rounded-xl border border-serenity-green px-6 py-3 ${isInline ? 'mt-4' : 'mt-6'}`}
        onPress={onRetry}
      >
        <Text className="font-sans-semibold text-serenity-green">Tentar novamente</Text>
      </Pressable>
    </View>
  );
}
