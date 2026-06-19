import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useActivityFeed } from '@/core/services/usecases/activity/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { ActivityCard } from '@/ui/DataDisplay/ActivityCard';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

export function FeedScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useActivityFeed();
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
          message="Não foi possível carregar as atividades."
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
            title="Nenhuma atividade ainda"
            description="Toque no botão central para registrar sua primeira ligação."
          />
        }
        ListHeaderComponent={
          items.length > 0 ? (
            <Text className="mb-4 font-sans-semibold text-xl text-mindful-brown">Atividades</Text>
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
        renderItem={({ item }: { item: ActivityFeedItem }) => <ActivityCard item={item} />}
      />
      {isError ? (
        <View className="px-4 pb-4">
          <QueryErrorState
            message="Não foi possível atualizar as atividades."
            variant="inline"
            onRetry={() => {
              void refetch();
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
