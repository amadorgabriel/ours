import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { Goal, GoalContribution } from '@/core/domain/goal';
import {
  useGoalContributions,
  useGoals,
} from '@/core/services/usecases/goal/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { GoalCard } from '@/ui/DataDisplay/GoalCard';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

import { ContributeSheet } from '../contribute-sheet';

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

function formatContributionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ContributionRow({ contribution }: { contribution: GoalContribution }) {
  return (
    <View className="flex-row items-center justify-between border-b border-mindful-brown/10 py-3">
      <View className="flex-1 pr-3">
        <Text className="font-sans-semibold text-sm text-mindful-brown">
          {contribution.userName}
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-mindful-brown/60">
          {formatContributionDate(contribution.createdAt)}
        </Text>
      </View>
      <Text className="font-sans-semibold text-sm text-mindful-brown">
        {contribution.amount !== null ? formatCurrency(contribution.amount) : '—'}
      </Text>
    </View>
  );
}

function ContributionsEmptyState() {
  return <EmptyState title="Nenhuma contribuição ainda." variant="inline" />;
}

export function GoalDetailSheet({ visible, goal, onClose }: GoalDetailSheetProps) {
  const [contributeVisible, setContributeVisible] = useState(false);
  const { data: goalsData, refetch: refetchGoals } = useGoals();
  const {
    data: contributionsData,
    isLoading: contributionsLoading,
    isRefetching,
    refetch: refetchContributions,
  } = useGoalContributions(visible && goal ? goal.id : null);

  if (!goal) {
    return null;
  }

  const liveGoal = goalsData?.items.find((item) => item.id === goal.id) ?? goal;
  const remaining = Math.max(0, liveGoal.targetAmount - liveGoal.currentAmount);
  const contributions = contributionsData?.items ?? [];

  function handleRefresh() {
    void refetchGoals();
    void refetchContributions();
  }

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Detalhe da meta">
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              tintColor={colors.serenityGreen60}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-sans-semibold text-xl text-mindful-brown">{liveGoal.title}</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
            Criada em {formatDate(liveGoal.createdAt)}
          </Text>

          <View className="mt-4">
            <GoalCard goal={liveGoal} />
          </View>

          <View className="mt-4 rounded-xl bg-white/80 p-4">
            <Text className="font-sans text-sm text-mindful-brown/70">Faltam</Text>
            <Text className="mt-1 font-sans-semibold text-lg text-mindful-brown">
              {formatCurrency(remaining)}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Contribuir"
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            onPress={() => setContributeVisible(true)}
          >
            <Text className="font-sans-semibold text-light">Contribuir</Text>
          </Pressable>

          <Text className="mb-2 mt-6 font-sans-semibold text-base text-mindful-brown">
            Contribuições
          </Text>

          {contributionsLoading && contributions.length === 0 ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.serenityGreen60} />
            </View>
          ) : contributions.length === 0 ? (
            <ContributionsEmptyState />
          ) : (
            contributions.map((contribution) => (
              <ContributionRow key={contribution.id} contribution={contribution} />
            ))
          )}
        </ScrollView>
      </BottomSheet>

      <ContributeSheet
        goalId={goal.id}
        visible={contributeVisible}
        onClose={() => setContributeVisible(false)}
      />
    </>
  );
}
