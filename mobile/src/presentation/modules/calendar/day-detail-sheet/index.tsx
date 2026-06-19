import { FlatList, Text } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { ActivityCard } from '@/ui/DataDisplay/ActivityCard';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

type DayDetailSheetProps = {
  visible: boolean;
  dateLabel: string;
  items: ActivityFeedItem[];
  onClose: () => void;
};

export function DayDetailSheet({ visible, dateLabel, items, onClose }: DayDetailSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Atividades do dia">
      <Text className="font-sans-semibold text-xl text-mindful-brown">{dateLabel}</Text>
      <Text className="mb-4 mt-1 font-sans text-sm text-mindful-brown/70">
        {items.length === 1 ? '1 atividade' : `${items.length} atividades`}
      </Text>

      {items.length === 0 ? (
        <EmptyState title="Nenhuma atividade neste dia." variant="inline" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard item={item} />}
          style={{ maxHeight: 320 }}
        />
      )}
    </BottomSheet>
  );
}
