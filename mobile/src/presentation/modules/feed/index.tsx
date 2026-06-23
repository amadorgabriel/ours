import { useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import type { ViewToken } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import {
  useActivityFeed,
  useMarkActivitySeen,
} from '@/core/services/usecases/activity/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { ActivityCard } from '@/ui/DataDisplay/ActivityCard';
import { EmptyState } from '@/ui/Feedback/EmptyState';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

export function FeedScreen() {
  const { data, isLoading, isError, isRefetching, refetch } = useActivityFeed();
  const markSeen = useMarkActivitySeen();
  const markedIdsRef = useRef(new Set<string>());
  const pendingSeenIdsRef = useRef(new Set<string>());
  const items = data?.items ?? [];

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      for (const token of viewableItems) {
        const item = token.item as ActivityFeedItem;
        if (
          !item?.id ||
          markedIdsRef.current.has(item.id) ||
          pendingSeenIdsRef.current.has(item.id)
        ) {
          continue;
        }

        pendingSeenIdsRef.current.add(item.id);
        markSeen.mutate(item.id, {
          onSuccess: () => {
            markedIdsRef.current.add(item.id);
            pendingSeenIdsRef.current.delete(item.id);
          },
          onError: () => {
            pendingSeenIdsRef.current.delete(item.id);
          },
        });
      }
    },
    [markSeen]
  );

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
            description="Toque no botão + para registrar sua primeira atividade."
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
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onViewableItemsChanged={handleViewableItemsChanged}
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
