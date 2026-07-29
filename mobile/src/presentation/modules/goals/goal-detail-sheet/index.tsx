import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Goal, GoalContribution } from '@/core/domain/goal';
import {
  useDeleteGoal,
  useDeleteGoalContribution,
  useGoalContributions,
  useGoals,
} from '@/core/services/usecases/goal/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAppAlert } from '@/presentation/providers/alert';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { GoalCard } from '@/ui/DataDisplay/GoalCard';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

import { ContributeSheet } from '../contribute-sheet';
import { EditContributionSheet } from '../edit-contribution-sheet';
import { getContributionErrorMessage, getDeleteGoalErrorMessage } from '../goals-api-error';

type GoalDetailSheetProps = {
  visible: boolean;
  goal: Goal | null;
  onClose: () => void;
};

const ICON_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

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

function ContributionRow({
  contribution,
  isAuthor,
  onEdit,
  onDelete,
}: {
  contribution: GoalContribution;
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between border-b border-mindful-brown/10 py-3">
      <View className="flex-1 pr-3">
        <Text className="font-sans-semibold text-sm text-mindful-brown">
          {contribution.userName}
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-mindful-brown/60">
          {formatContributionDate(contribution.createdAt)}
          {contribution.isPrivate ? ` · ${t('common.private')}` : ''}
        </Text>
      </View>
      <Text className="font-sans-semibold text-sm text-mindful-brown">
        {contribution.amount !== null ? formatCurrency(contribution.amount) : '—'}
      </Text>
      {isAuthor ? (
        <View className="ml-2 flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('goals.editContributionAccessibility')}
            className="h-11 w-11 items-center justify-center"
            hitSlop={ICON_HIT_SLOP}
            onPress={onEdit}
          >
            <Ionicons color={colors.serenityGreen60} name="pencil" size={20} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('goals.deleteContributionAccessibility')}
            className="h-11 w-11 items-center justify-center"
            hitSlop={ICON_HIT_SLOP}
            onPress={onDelete}
          >
            <Ionicons color="#dc2626" name="trash" size={20} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ContributionsEmptyState() {
  const { t } = useTranslation();
  return <EmptyState title={t('goals.noContributions')} variant="inline" />;
}

export function GoalDetailSheet({ visible, goal, onClose }: GoalDetailSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const [contributeVisible, setContributeVisible] = useState(false);
  const [editingContribution, setEditingContribution] = useState<GoalContribution | null>(null);
  const { data: goalsData, refetch: refetchGoals } = useGoals();
  const {
    data: contributionsData,
    isLoading: contributionsLoading,
    isRefetching,
    refetch: refetchContributions,
  } = useGoalContributions(visible && goal ? goal.id : null);
  const deleteGoal = useDeleteGoal();
  const deleteContribution = useDeleteGoalContribution(goal?.id ?? '');

  if (!goal) {
    return null;
  }

  const liveGoal = goalsData?.items.find((item) => item.id === goal.id) ?? goal;
  const remaining = Math.max(0, liveGoal.targetAmount - liveGoal.currentAmount);
  const contributions = contributionsData?.items ?? [];
  const activeFamily = session?.families.find((family) => family.id === familyId);
  const isAdmin = activeFamily?.role === 'Admin';
  const canDeleteGoal =
    session?.user.id === liveGoal.createdBy || isAdmin;

  function handleRefresh() {
    void refetchGoals();
    void refetchContributions();
  }

  function handleDeleteContribution(contribution: GoalContribution) {
    alert(t('alerts.deleteContribution.title'), t('alerts.deleteContribution.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('alerts.deleteContribution.confirm'),
        style: 'destructive',
        onPress: () =>
          deleteContribution.mutate(contribution.id, {
            onError: (error) => {
              alert(t('alerts.deleteContribution.errorDelete'), getContributionErrorMessage(error));
            },
          }),
      },
    ]);
  }

  function confirmDeleteGoal() {
    if (deleteGoal.isPending) {
      return;
    }

    const hasContributions = contributions.length > 0;
    const message = hasContributions
      ? t('alerts.deleteGoal.withContributionsMessage')
      : t('alerts.deleteGoal.message');

    alert(t('alerts.deleteGoal.title'), message, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('alerts.deleteGoal.confirm'),
        style: 'destructive',
        onPress: () =>
          deleteGoal.mutate(liveGoal.id, {
            onSuccess: () => {
              onClose();
            },
            onError: (error) => {
              alert(t('alerts.deleteGoal.errorTitle'), getDeleteGoalErrorMessage(error));
            },
          }),
      },
    ]);
  }

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        accessibilityLabel={t('goals.detailAccessibility')}
        scrollable
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            tintColor={colors.serenityGreen60}
            onRefresh={handleRefresh}
          />
        }
      >
        <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="font-sans-semibold text-xl text-mindful-brown">{liveGoal.title}</Text>
              <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
                {t('goals.createdAt', { date: formatDate(liveGoal.createdAt) })}
              </Text>
            </View>
            {canDeleteGoal ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('goals.deleteGoalAccessibility')}
                accessibilityState={{ disabled: deleteGoal.isPending }}
                className="h-11 w-11 items-center justify-center"
                disabled={deleteGoal.isPending}
                hitSlop={ICON_HIT_SLOP}
                onPress={confirmDeleteGoal}
              >
                {deleteGoal.isPending ? (
                  <ActivityIndicator color="#dc2626" size="small" />
                ) : (
                  <Ionicons color="#dc2626" name="trash" size={22} />
                )}
              </Pressable>
            ) : null}
          </View>

          <View className="mt-4">
            <GoalCard goal={liveGoal} />
          </View>

          <View className="mt-4 rounded-xl bg-white/80 p-4">
            <Text className="font-sans text-sm text-mindful-brown/70">{t('goals.remaining')}</Text>
            <Text className="mt-1 font-sans-semibold text-lg text-mindful-brown">
              {formatCurrency(remaining)}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('goals.contributeAccessibility')}
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            onPress={() => setContributeVisible(true)}
          >
            <Text className="font-sans-semibold text-light">{t('goals.contribute')}</Text>
          </Pressable>

          <Text className="mb-2 mt-6 font-sans-semibold text-base text-mindful-brown">
            {t('goals.contributions')}
          </Text>

          {contributionsLoading && contributions.length === 0 ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.serenityGreen60} />
            </View>
          ) : contributions.length === 0 ? (
            <ContributionsEmptyState />
          ) : (
            contributions.map((contribution) => (
              <ContributionRow
                key={contribution.id}
                contribution={contribution}
                isAuthor={contribution.userId === session?.user.id}
                onDelete={() => handleDeleteContribution(contribution)}
                onEdit={() => setEditingContribution(contribution)}
              />
            ))
          )}
      </BottomSheet>

      <ContributeSheet
        goalId={goal.id}
        visible={contributeVisible}
        onClose={() => setContributeVisible(false)}
      />

      <EditContributionSheet
        contribution={editingContribution}
        goalId={goal.id}
        visible={editingContribution !== null}
        onClose={() => setEditingContribution(null)}
      />
    </>
  );
}
