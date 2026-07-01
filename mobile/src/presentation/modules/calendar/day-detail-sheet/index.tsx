import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
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
import { ImagePreview } from '@/ui/Feedback/ImagePreview';

type DayDetailSheetProps = {
  visible: boolean;
  date: CalendarDate;
  items: ActivityFeedItem[];
  familyCreatedAt?: string;
  getItemsForDate: (date: CalendarDate) => ActivityFeedItem[];
  onClose: () => void;
  onDateChange: (date: CalendarDate) => void;
};

const PAGE_HEADER_HEIGHT = 56;
const EMPTY_STATE_HEIGHT = 100;
const ACTIVITY_CARD_ESTIMATE = 120;
const ACTIVITY_CARD_WITH_PHOTO_ESTIMATE = 300;

function estimateCardHeight(item: ActivityFeedItem): number {
  return item.type === 'Visit' && item.photoUrl
    ? ACTIVITY_CARD_WITH_PHOTO_ESTIMATE
    : ACTIVITY_CARD_ESTIMATE;
}

function estimatePageHeight(items: ActivityFeedItem[]): number {
  if (items.length === 0) {
    return PAGE_HEADER_HEIGHT + EMPTY_STATE_HEIGHT;
  }

  return PAGE_HEADER_HEIGHT + items.reduce((sum, item) => sum + estimateCardHeight(item), 0);
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

function DayPageContent({
  date,
  items,
  onPhotoPress,
}: {
  date: CalendarDate;
  items: ActivityFeedItem[];
  onPhotoPress: (uri: string) => void;
}) {
  const { t } = useTranslation();
  const dateLabel = formatCalendarDayLabel(date);

  return (
    <View>
      <Text className="font-sans-semibold text-xl text-mindful-brown">{dateLabel}</Text>
      <Text className="mb-4 mt-1 font-sans text-sm text-mindful-brown/70">
        {t('calendar.activityCount', { count: items.length })}
      </Text>
      {items.length === 0 ? (
        <EmptyState title={t('calendar.emptyDay')} variant="inline" />
      ) : (
        items.map((item) => (
          <ActivityCard key={item.id} item={item} onPhotoPress={onPhotoPress} />
        ))
      )}
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
  const pagerRef = useRef<PagerView>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

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

  const pagerHeight = useMemo(() => {
    const heights = pages.map((pageDate) =>
      estimatePageHeight(resolvePageItems(pageDate, date, items, getItemsForDate))
    );

    return Math.max(...heights);
  }, [date, getItemsForDate, items, pages]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    pagerRef.current?.setPageWithoutAnimation(currentPageIndex);
  }, [currentPageIndex, date.day, date.month, date.year, visible]);

  return (
    <>
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel={t('calendar.dayDetailAccessibility')}
      scrollable
    >
      {pages.length > 1 ? (
        <PagerView
          ref={pagerRef}
          initialPage={currentPageIndex}
          style={{ height: pagerHeight }}
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
              <DayPageContent
                date={pageDate}
                items={resolvePageItems(pageDate, date, items, getItemsForDate)}
                onPhotoPress={(uri) => setPreviewUri(uri)}
              />
            </View>
          ))}
        </PagerView>
      ) : (
        <DayPageContent
          date={date}
          items={items}
          onPhotoPress={(uri) => setPreviewUri(uri)}
        />
      )}
    </BottomSheet>
    <ImagePreview
      uri={previewUri ?? ''}
      visible={previewUri !== null}
      onClose={() => setPreviewUri(null)}
    />
    </>
  );
}
