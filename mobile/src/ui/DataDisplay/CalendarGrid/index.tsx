import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';

const MONTH_KEYS = [
  'calendar.months.january',
  'calendar.months.february',
  'calendar.months.march',
  'calendar.months.april',
  'calendar.months.may',
  'calendar.months.june',
  'calendar.months.july',
  'calendar.months.august',
  'calendar.months.september',
  'calendar.months.october',
  'calendar.months.november',
  'calendar.months.december',
] as const;

const WEEKDAY_KEYS = [
  'calendar.weekdays.mon',
  'calendar.weekdays.tue',
  'calendar.weekdays.wed',
  'calendar.weekdays.thu',
  'calendar.weekdays.fri',
  'calendar.weekdays.sat',
  'calendar.weekdays.sun',
] as const;

export type CalendarGridProps = {
  year: number;
  month: number;
  daysWithActivity: Set<number>;
  isLoading?: boolean;
  onDayPress: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: (number | null)[] = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function CalendarGrid({
  year,
  month,
  daysWithActivity,
  isLoading = false,
  onDayPress,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const { t } = useTranslation();
  const cells = buildCalendarDays(year, month);
  const monthLabel = `${t(MONTH_KEYS[month - 1])} ${year}`;

  return (
    <View className="relative">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.prevMonthAccessibility')}
          className="min-h-11 min-w-11 items-center justify-center"
          onPress={onPrevMonth}
        >
          <Text className="font-sans-semibold text-lg text-mindful-brown">‹</Text>
        </Pressable>
        <Text className="font-sans-semibold text-lg text-mindful-brown">{monthLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.nextMonthAccessibility')}
          className="min-h-11 min-w-11 items-center justify-center"
          onPress={onNextMonth}
        >
          <Text className="font-sans-semibold text-lg text-mindful-brown">›</Text>
        </Pressable>
      </View>

      <View className="mb-2 flex-row">
        {WEEKDAY_KEYS.map((key) => (
          <View key={key} className="flex-1 items-center py-1">
            <Text className="font-sans text-xs text-mindful-brown/60">{t(key)}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, index) => (
          <View key={`${year}-${month}-${index}`} className="w-[14.28%] items-center py-1">
            {day ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('calendar.dayAccessibility', { day })}
                className="min-h-11 min-w-11 items-center justify-center rounded-full"
                onPress={() => onDayPress(day)}
              >
                <Text className="font-sans text-mindful-brown">{day}</Text>
                {daysWithActivity.has(day) ? (
                  <View
                    className="mt-0.5 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: colors.serenityGreen60 }}
                  />
                ) : (
                  <View className="mt-0.5 h-1.5 w-1.5" />
                )}
              </Pressable>
            ) : (
              <View className="min-h-11 min-w-11" />
            )}
          </View>
        ))}
      </View>

      {isLoading ? (
        <View className="absolute inset-0 items-center justify-center rounded-2xl bg-cream/70">
          <ActivityIndicator color={colors.serenityGreen60} />
        </View>
      ) : null}
    </View>
  );
}
