import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useActivityFeed } from '@/core/services/usecases/activity/index.hooks';
import { colors } from '@/presentation/styles/tokens';
import { ActivityCard } from '@/ui/DataDisplay/ActivityCard';

function FeedEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <Text className="font-sans-semibold text-lg text-mindful-brown">Nenhuma atividade ainda</Text>
      <Text className="mt-2 text-center font-sans text-sm text-mindful-brown/70">
        Toque no botão central para registrar sua primeira ligação.
      </Text>
    </View>
  );
}

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

  return (
    <View className="flex-1 bg-cream">
      <FlatList
        contentContainerStyle={items.length === 0 ? { flexGrow: 1 } : { padding: 16, paddingBottom: 24 }}
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={FeedEmptyState}
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
          <Text className="font-sans text-sm text-red-600">
            Não foi possível carregar as atividades. Puxe para tentar novamente.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
