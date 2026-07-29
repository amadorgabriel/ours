'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { useActivitiesByMonth } from '@/core/services/usecases/activity/index.hooks';
import {
  getActivityCountByDay,
  toLocalDateKey,
} from '@/core/services/usecases/activity/month-range';
import { useFamily } from '@/presentation/providers/family';
import { CalendarGrid } from '@/ui/DataDisplay/CalendarGrid';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Alert } from '@/ui/Feedback/Alert';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { DayDetailModal } from './day-detail-modal';

function formatDayLabel(year: number, month: number, day: number): string {
  const date = new Date(year, month - 1, day);
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
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

export function CalendarPage() {
  const t = useTranslations('calendar');
  const { familyId } = useFamily();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useActivitiesByMonth(year, month);
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const activityCountByDay = useMemo(() => getActivityCountByDay(items), [items]);
  const selectedItems = selectedDay ? filterItemsForDay(items, year, month, selectedDay) : [];
  const selectedDateLabel = selectedDay ? formatDayLabel(year, month, selectedDay) : '';

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

  return (
    <>
      <Page
        header={
          <Stack gap="xs" align="stretch">
            <Title order={2}>{t('title')}</Title>
            <Text c="dimmed">{t('subtitle')}</Text>
          </Stack>
        }
      >
        {!familyId ? (
          <Alert color="yellow" variant="light">
            {t('noFamily')}
          </Alert>
        ) : isLoading && items.length === 0 ? (
          <Text c="dimmed">{t('loading')}</Text>
        ) : isError && items.length === 0 ? (
          <Stack gap="md" align="stretch">
            <Alert color="red" variant="light">
              {t('loadError')}
            </Alert>
            <Button variant="light" onClick={() => void refetch()}>
              {t('retry')}
            </Button>
          </Stack>
        ) : (
          <Stack gap="md" align="stretch">
            <SurfaceCard>
              <CalendarGrid
                year={year}
                month={month}
                activityCountByDay={activityCountByDay}
                onDayPress={(day) => setSelectedDay(day)}
                onPrevMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
                prevMonthLabel={t('prevMonth')}
                nextMonthLabel={t('nextMonth')}
              />
            </SurfaceCard>

            {isError ? (
              <Stack gap="sm" align="stretch">
                <Alert color="red" variant="light">
                  {t('refreshError')}
                </Alert>
                <Button variant="light" onClick={() => void refetch()}>
                  {t('retry')}
                </Button>
              </Stack>
            ) : null}
          </Stack>
        )}
      </Page>

      <DayDetailModal
        opened={selectedDay !== null}
        dateLabel={selectedDateLabel}
        items={selectedItems}
        onClose={() => setSelectedDay(null)}
      />
    </>
  );
}
