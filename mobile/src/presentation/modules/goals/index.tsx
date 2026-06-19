import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import type { Goal } from '@/core/domain/goal';
import { useGoals } from '@/core/services/usecases/goal/index.hooks';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { GoalCard } from '@/ui/DataDisplay/GoalCard';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

import { CreateGoalSheet } from './create-goal-sheet';
import { GoalDetailSheet } from './goal-detail-sheet';

export function GoalsScreen() {
  const { session } = useAuth();
  const { familyId } = useFamily();
  const { data, isLoading, isError, isRefetching, refetch } = useGoals();
  const [createVisible, setCreateVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const isAdmin = activeFamily?.role === 'Admin';
  const items = data?.items ?? [];

  if (isLoading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.serenityGreen60} />
      </View>
    );
  }

  if (isError && items.length === 0) {
    return (
      <View className="flex-1 bg-cream">
        <QueryErrorState
          message="Não foi possível carregar as metas."
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        contentContainerStyle={items.length === 0 ? { flexGrow: 1 } : { padding: 16, paddingBottom: 24 }}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma meta ainda"
            description={
              isAdmin
                ? 'Crie a primeira meta financeira da família.'
                : 'Peça ao administrador da família para criar uma meta.'
            }
            actionLabel={isAdmin ? 'Nova meta' : undefined}
            onAction={isAdmin ? () => setCreateVisible(true) : undefined}
          />
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-sans-semibold text-xl text-mindful-brown">Metas</Text>
              {isAdmin ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Nova meta"
                  className="rounded-xl bg-serenity-green px-4 py-2"
                  onPress={() => setCreateVisible(true)}
                >
                  <Text className="font-sans-semibold text-sm text-light">Nova meta</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            tintColor={colors.serenityGreen60}
            onRefresh={() => {
              void refetch();
            }}
          />
        }
        renderItem={({ item }: { item: Goal }) => (
          <GoalCard goal={item} onPress={() => setSelectedGoal(item)} />
        )}
      />
      {isError ? (
        <View className="px-4 pb-4">
          <QueryErrorState
            message="Não foi possível atualizar as metas."
            variant="inline"
            onRetry={() => {
              void refetch();
            }}
          />
        </View>
      ) : null}

      <CreateGoalSheet visible={createVisible} onClose={() => setCreateVisible(false)} />
      <GoalDetailSheet
        goal={selectedGoal}
        visible={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
      />
    </View>
  );
}
