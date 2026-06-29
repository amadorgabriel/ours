import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import PagerView from 'react-native-pager-view';

import type { ActivityFeedItem } from '@/core/domain/activity';
import {
  addCalendarDays,
  formatCalendarDayLabel,
  isCalendarDayEnabled,
  type CalendarDate,
} from '@/core/services/usecases/activity/calendar-day';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { ActivityCard } from '@/ui/DataDisplay/ActivityCard';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { EmptyState } from '@/ui/Feedback/EmptyState';

type DayDetailSheetProps = {
  visible: boolean;
  date: CalendarDate;
  items: ActivityFeedItem[];
  familyCreatedAt?: string;
  getItemsForDate: (date: CalendarDate) => ActivityFeedItem[];
  onClose: () => void;
  onDateChange: (date: CalendarDate) => void;
};

const SHEET_HEADER_HEIGHT = 88;
const EMPTY_STATE_HEIGHT = 100;
const ACTIVITY_CARD_ESTIMATE = 100;

function estimateSheetHeight(itemCount: number, listMaxHeight: number): number {
  const maxSheetHeight = listMaxHeight + SHEET_HEADER_HEIGHT;

  if (itemCount === 0) {
    return Math.min(SHEET_HEADER_HEIGHT + EMPTY_STATE_HEIGHT, maxSheetHeight);
  }

  const estimatedListHeight = Math.min(itemCount * ACTIVITY_CARD_ESTIMATE, listMaxHeight);
  return Math.min(SHEET_HEADER_HEIGHT + estimatedListHeight, maxSheetHeight);
}

function resolvePageItems(
  pageDate: CalendarDate,
  date: CalendarDate,
  items: ActivityFeedItem[],
  getItemsForDate: (date: CalendarDate) => ActivityFeedItem[]
): ActivityFeedItem[] {
  if (
    pageDate.year === date.year &&
    pageDate.month === date.month &&
    pageDate.day === date.day
  ) {
    return items;
  }

  return getItemsForDate(pageDate);
}

function DayActivities({
  items,
  listMaxHeight,
}: {
  items: ActivityFeedItem[];
  listMaxHeight: number;
}) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return <EmptyState title={t('calendar.emptyDay')} variant="inline" />;
  }

  return (
    <BottomSheetFlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityCard item={item} />}
      showsVerticalScrollIndicator
      style={{ maxHeight: listMaxHeight }}
    />
  );
}

function DayPage({
  date,
  items,
  listMaxHeight,
}: {
  date: CalendarDate;
  items: ActivityFeedItem[];
  listMaxHeight: number;
}) {
  const { t } = useTranslation();
  const dateLabel = formatCalendarDayLabel(date);

  return (
    <View>
      <Text className="font-sans-semibold text-xl text-mindful-brown">{dateLabel}</Text>
      <Text className="mb-4 mt-1 font-sans text-sm text-mindful-brown/70">
        {t('calendar.activityCount', { count: items.length })}
      </Text>
      <DayActivities items={items} listMaxHeight={listMaxHeight} />
    </View>
  );
}

export function DayDetailSheet({
  visible,
  date,
  items,
  familyCreatedAt,
  getItemsForDate,
  onClose,
  onDateChange,
}: DayDetailSheetProps) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const pagerRef = useRef<PagerView>(null);
  const listMaxHeight = windowHeight * 0.9 - SHEET_HEADER_HEIGHT;

  const prevDate = addCalendarDays(date, -1);
  const nextDate = addCalendarDays(date, 1);
  const canSwipePrev = isCalendarDayEnabled(prevDate, familyCreatedAt);
  const canSwipeNext = isCalendarDayEnabled(nextDate, familyCreatedAt);

  const pages = useMemo(() => {
    const result: CalendarDate[] = [date];
    if (canSwipePrev) {
      result.unshift(prevDate);
    }
    if (canSwipeNext) {
      result.push(nextDate);
    }
    return result;
  }, [canSwipeNext, canSwipePrev, date, nextDate, prevDate]);

  const currentPageIndex = canSwipePrev ? 1 : 0;

  const sheetHeight = useMemo(() => {
    const heights = pages.map((pageDate) =>
      estimateSheetHeight(
        resolvePageItems(pageDate, date, items, getItemsForDate).length,
        listMaxHeight
      )
    );

    return Math.max(...heights);
  }, [date, getItemsForDate, items, listMaxHeight, pages]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    pagerRef.current?.setPageWithoutAnimation(currentPageIndex);
  }, [currentPageIndex, date.day, date.month, date.year, visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel={t('calendar.dayDetailAccessibility')}
    >
      {pages.length > 1 ? (
        <PagerView
          ref={pagerRef}
          initialPage={currentPageIndex}
          style={{ height: sheetHeight }}
          onPageSelected={(event) => {
            const position = event.nativeEvent.position;
            if (position === currentPageIndex) {
              return;
            }

            const nextDateSelection = pages[position];
            if (!nextDateSelection) {
              pagerRef.current?.setPageWithoutAnimation(currentPageIndex);
              return;
            }

            onDateChange(nextDateSelection);
          }}
        >
          {pages.map((pageDate) => (
            <View key={`${pageDate.year}-${pageDate.month}-${pageDate.day}`}>
              <DayPage
                date={pageDate}
                items={resolvePageItems(pageDate, date, items, getItemsForDate)}
                listMaxHeight={listMaxHeight}
              />
            </View>
          ))}
        </PagerView>
      ) : (
        <DayPage date={date} items={items} listMaxHeight={listMaxHeight} />
      )}
    </BottomSheet>
  );
}
