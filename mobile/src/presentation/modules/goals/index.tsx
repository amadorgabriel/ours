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
import { useListBottomPadding } from '@/presentation/modules/app-shell/list-bottom-padding';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';
import { GoalCard } from '@/ui/DataDisplay/GoalCard';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

import { CreateGoalSheet } from './create-goal-sheet';
import { GoalDetailSheet } from './goal-detail-sheet';

export function GoalsScreen() {
  const { t } = useTranslation();
  const listBottomPadding = useListBottomPadding();
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
          message={t('goals.loadError')}
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
        contentContainerStyle={
          items.length === 0
            ? { flexGrow: 1 }
            : { padding: 16, paddingBottom: listBottomPadding }
        }
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title={t('goals.emptyTitle')}
            description={
              isAdmin ? t('goals.emptyAdminDescription') : t('goals.emptyMemberDescription')
            }
            actionLabel={isAdmin ? t('goals.newGoal') : undefined}
            onAction={isAdmin ? () => setCreateVisible(true) : undefined}
          />
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-sans-semibold text-xl text-mindful-brown">{t('goals.title')}</Text>
              {isAdmin ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('goals.newGoal')}
                  className="rounded-xl bg-serenity-green px-4 py-2"
                  onPress={() => setCreateVisible(true)}
                >
                  <Text className="font-sans-semibold text-sm text-light">{t('goals.newGoal')}</Text>
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
            message={t('goals.refreshError')}
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
