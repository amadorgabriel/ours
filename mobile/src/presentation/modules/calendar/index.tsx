import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useActivitiesByMonth } from '@/core/services/usecases/activity/index.hooks';
import {
  getDaysWithActivities,
  toLocalDateKey,
} from '@/core/services/usecases/activity/month-range';
import { colors } from '@/presentation/styles/tokens';
import { CalendarGrid } from '@/ui/DataDisplay/CalendarGrid';

import { DayDetailSheet } from './day-detail-sheet';

function formatDayLabel(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function filterItemsForDay(
  items: ActivityFeedItem[],
  year: number,
  month: number,
  day: number
): ActivityFeedItem[] {
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return items.filter((item) => toLocalDateKey(item.createdAt) === key);
}

export function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data, isLoading, isError, isRefetching, refetch } = useActivitiesByMonth(year, month);
  const items = data?.items ?? [];

  const daysWithActivity = useMemo(() => getDaysWithActivities(items), [items]);
  const selectedItems = selectedDay
    ? filterItemsForDay(items, year, month, selectedDay)
    : [];
  const selectedDateLabel = selectedDay
    ? formatDayLabel(year, month, selectedDay)
    : '';

  function goToPreviousMonth() {
    if (month === 1) {
      setYear((current) => current - 1);
      setMonth(12);
      return;
    }

    setMonth((current) => current - 1);
  }

  function goToNextMonth() {
    if (month === 12) {
      setYear((current) => current + 1);
      setMonth(1);
      return;
    }

    setMonth((current) => current + 1);
  }

  if (isLoading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color={colors.serenityGreen60} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            tintColor={colors.serenityGreen60}
            onRefresh={() => {
              void refetch();
            }}
          />
        }
      >
        <Text className="mb-4 font-sans-semibold text-xl text-mindful-brown">Calendário</Text>

        <CalendarGrid
          year={year}
          month={month}
          daysWithActivity={daysWithActivity}
          onDayPress={(day) => setSelectedDay(day)}
          onPrevMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />

        {isError ? (
          <Text className="mt-4 font-sans text-sm text-red-600">
            Não foi possível carregar as atividades. Puxe para tentar novamente.
          </Text>
        ) : null}
      </ScrollView>

      <DayDetailSheet
        visible={selectedDay !== null}
        dateLabel={selectedDateLabel}
        items={selectedItems}
        onClose={() => setSelectedDay(null)}
      />
    </View>
  );
}
