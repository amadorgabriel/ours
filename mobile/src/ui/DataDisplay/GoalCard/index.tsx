import { Pressable, Text, View } from 'react-native';

import type { Goal } from '@/core/domain/goal';

type GoalCardProps = {
  goal: Goal;
  onPress?: () => void;
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const progress = getProgressPercent(goal.currentAmount, goal.targetAmount);

  const content = (
    <>
      <Text className="font-sans-semibold text-mindful-brown">{goal.title}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/70">
        {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
      </Text>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-mindful-brown/10">
        <View
          className="h-full rounded-full bg-serenity-green"
          style={{ width: `${progress}%` }}
        />
      </View>
      <Text className="mt-2 font-sans text-xs text-mindful-brown/60">{progress}% concluído</Text>
    </>
  );

  if (!onPress) {
    return <View className="mb-3 rounded-2xl bg-white/80 p-4">{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Meta ${goal.title}`}
      className="mb-3 rounded-2xl bg-white/80 p-4"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
