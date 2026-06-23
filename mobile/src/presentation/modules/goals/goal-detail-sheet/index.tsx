import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { Goal, GoalContribution } from '@/core/domain/goal';
import {
  useDeleteGoalContribution,
  useGoalContributions,
  useGoals,
  useUpdateGoalContribution,
} from '@/core/services/usecases/goal/index.hooks';
import { useAuth } from '@/presentation/providers/auth';
import { colors } from '@/presentation/styles/tokens';
import { GoalCard } from '@/ui/DataDisplay/GoalCard';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

import { ContributeSheet } from '../contribute-sheet';
import { getContributionErrorMessage } from '../goals-api-error';

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
  return (
    <View className="flex-row items-center justify-between border-b border-mindful-brown/10 py-3">
      <View className="flex-1 pr-3">
        <Text className="font-sans-semibold text-sm text-mindful-brown">
          {contribution.userName}
        </Text>
        <Text className="mt-0.5 font-sans text-xs text-mindful-brown/60">
          {formatContributionDate(contribution.createdAt)}
          {contribution.isPrivate ? ' · Privada' : ''}
        </Text>
      </View>
      <Text className="font-sans-semibold text-sm text-mindful-brown">
        {contribution.amount !== null ? formatCurrency(contribution.amount) : '—'}
      </Text>
      {isAuthor ? (
        <View className="ml-2">
          <Pressable accessibilityRole="button" accessibilityLabel="Editar contribuição" onPress={onEdit}>
            <Text className="font-sans-semibold text-xs text-serenity-green">Editar</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Excluir contribuição" onPress={onDelete}>
            <Text className="mt-1 font-sans-semibold text-xs text-red-600">Excluir</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ContributionsEmptyState() {
  return <EmptyState title="Nenhuma contribuição ainda." variant="inline" />;
}

export function GoalDetailSheet({ visible, goal, onClose }: GoalDetailSheetProps) {
  const { session } = useAuth();
  const [contributeVisible, setContributeVisible] = useState(false);
  const [editingContribution, setEditingContribution] = useState<GoalContribution | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPrivate, setEditPrivate] = useState(false);
  const { data: goalsData, refetch: refetchGoals } = useGoals();
  const {
    data: contributionsData,
    isLoading: contributionsLoading,
    isRefetching,
    refetch: refetchContributions,
  } = useGoalContributions(visible && goal ? goal.id : null);
  const updateContribution = useUpdateGoalContribution(goal?.id ?? '');
  const deleteContribution = useDeleteGoalContribution(goal?.id ?? '');

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

  function startEdit(contribution: GoalContribution) {
    setEditingContribution(contribution);
    setEditAmount(contribution.amount?.toString() ?? '');
    setEditPrivate(contribution.isPrivate);
  }

  function handleSaveEdit() {
    if (!editingContribution) return;

    const amount = Number.parseFloat(editAmount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount < 1) {
      Alert.alert('Valor inválido', 'Informe um valor válido (mínimo R$ 1,00).');
      return;
    }

    updateContribution.mutate(
      {
        contributionId: editingContribution.id,
        data: { amount, isPrivate: editPrivate },
      },
      {
        onSuccess: () => {
          setEditingContribution(null);
        },
        onError: (error) => {
          Alert.alert('Erro ao salvar', getContributionErrorMessage(error));
        },
      }
    );
  }

  function handleDelete(contribution: GoalContribution) {
    Alert.alert('Excluir contribuição', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          deleteContribution.mutate(contribution.id, {
            onError: (error) => {
              Alert.alert('Erro ao excluir', getContributionErrorMessage(error));
            },
          }),
      },
    ]);
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
              <ContributionRow
                key={contribution.id}
                contribution={contribution}
                isAuthor={contribution.userId === session?.user.id}
                onDelete={() => handleDelete(contribution)}
                onEdit={() => startEdit(contribution)}
              />
            ))
          )}

          {editingContribution ? (
            <View className="mt-4 rounded-xl bg-white/80 p-4">
              <Text className="font-sans-semibold text-mindful-brown">Editar contribuição</Text>
              <TextInput
                accessibilityLabel="Valor da contribuição"
                className="mt-3 rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
                keyboardType="decimal-pad"
                value={editAmount}
                onChangeText={setEditAmount}
              />
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="font-sans text-sm text-mindful-brown">Privada</Text>
                <Switch value={editPrivate} onValueChange={setEditPrivate} />
              </View>
              <View className="mt-3 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-xl border border-mindful-brown/20 py-3"
                  onPress={() => setEditingContribution(null)}
                >
                  <Text className="font-sans-semibold text-mindful-brown">Cancelar</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-xl bg-serenity-green py-3"
                  disabled={updateContribution.isPending}
                  onPress={handleSaveEdit}
                >
                  <Text className="font-sans-semibold text-light">Salvar</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
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
