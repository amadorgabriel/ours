import { Text, View } from 'react-native';

import type { Goal } from '@/core/domain/goal';
import { GoalCard } from '@/ui/DataDisplay/GoalCard';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';

type GoalDetailSheetProps = {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function GoalDetailSheet({ visible, goal, onClose }: GoalDetailSheetProps) {
  if (!goal) {
    return null;
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Detalhe da meta">
      <Text className="font-sans-semibold text-xl text-mindful-brown">{goal.title}</Text>
      <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
        Criada em {formatDate(goal.createdAt)}
      </Text>

      <View className="mt-4">
        <GoalCard goal={goal} />
      </View>

      <View className="mt-4 rounded-xl bg-white/80 p-4">
        <Text className="font-sans text-sm text-mindful-brown/70">Faltam</Text>
        <Text className="mt-1 font-sans-semibold text-lg text-mindful-brown">
          {formatCurrency(remaining)}
        </Text>
      </View>
    </BottomSheet>
  );
}
