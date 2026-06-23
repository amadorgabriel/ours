import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useActivitiesByMonth } from '@/core/services/usecases/activity/index.hooks';
import {
  type CalendarDate,
  isCalendarDayBeforeFamilyCreation,
  isCalendarDayEnabled,
  toCalendarDateKey,
} from '@/core/services/usecases/activity/calendar-day';
import {
  getDaysWithActivities,
  toLocalDateKey,
} from '@/core/services/usecases/activity/month-range';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { colors } from '@/presentation/styles/tokens';
import { CalendarGrid } from '@/ui/DataDisplay/CalendarGrid';
import { QueryErrorState } from '@/ui/Feedback/QueryErrorState';

import { DayDetailSheet } from './day-detail-sheet';

function filterItemsForDate(items: ActivityFeedItem[], date: CalendarDate): ActivityFeedItem[] {
  const key = toCalendarDateKey(date);
  return items.filter((item) => toLocalDateKey(item.createdAt) === key);
}

export function CalendarScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { familyId } = useFamily();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);

  const activeFamily = session?.families.find((family) => family.id === familyId);
  const familyCreatedAt = activeFamily?.createdAt;

  useEffect(() => {
    if (familyCreatedAt || !familyId) {
      return;
    }

    console.warn('[CalendarScreen] family.createdAt ausente — datas pré-família não serão desabilitadas');
  }, [familyCreatedAt, familyId]);

  const { data, isLoading, isError, isRefetching, isFetching, refetch } = useActivitiesByMonth(
    year,
    month
  );
  const items = data?.items ?? [];

  const isDayDisabled = useCallback(
    (day: number) =>
      isCalendarDayBeforeFamilyCreation({ year, month, day }, familyCreatedAt),
    [familyCreatedAt, month, year]
  );

  const daysWithActivity = useMemo(() => getDaysWithActivities(items), [items]);
  const selectedItems = selectedDate ? filterItemsForDate(items, selectedDate) : [];
  const showGridLoading = (isLoading || isFetching) && !isRefetching;

  const getItemsForDate = useCallback(
    (date: CalendarDate) => filterItemsForDate(items, date),
    [items]
  );

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

  function handleDayPress(day: number) {
    if (isDayDisabled(day)) {
      return;
    }

    setSelectedDate({ year, month, day });
  }

  function handleDateChange(date: CalendarDate) {
    if (!isCalendarDayEnabled(date, familyCreatedAt)) {
      return;
    }

    setYear(date.year);
    setMonth(date.month);
    setSelectedDate(date);
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
              setSelectedDate(null);
              void refetch();
            }}
          />
        }
      >
        <Text className="mb-4 font-sans-semibold text-xl text-mindful-brown">
          {t('calendar.title')}
        </Text>

        {isError && items.length === 0 ? (
          <QueryErrorState
            message={t('errors.calendar.loadFailed')}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : (
          <CalendarGrid
            year={year}
            month={month}
            daysWithActivity={daysWithActivity}
            isLoading={showGridLoading}
            isDayDisabled={isDayDisabled}
            onDayPress={handleDayPress}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
        )}

        {isError && items.length > 0 ? (
          <View className="mt-4">
            <QueryErrorState
              message={t('errors.calendar.refreshFailed')}
              variant="inline"
              onRetry={() => {
                void refetch();
              }}
            />
          </View>
        ) : null}
      </ScrollView>

      <DayDetailSheet
        visible={selectedDate !== null}
        date={selectedDate ?? { year, month, day: 1 }}
        items={selectedItems}
        familyCreatedAt={familyCreatedAt}
        getItemsForDate={getItemsForDate}
        onClose={() => setSelectedDate(null)}
        onDateChange={handleDateChange}
      />
    </View>
  );
}
