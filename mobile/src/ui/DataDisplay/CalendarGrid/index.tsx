import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors } from '@/presentation/styles/tokens';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

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
  const cells = buildCalendarDays(year, month);
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  return (
    <View className="relative">
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          className="min-h-11 min-w-11 items-center justify-center"
          onPress={onPrevMonth}
        >
          <Text className="font-sans-semibold text-lg text-mindful-brown">‹</Text>
        </Pressable>
        <Text className="font-sans-semibold text-lg text-mindful-brown">{monthLabel}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          className="min-h-11 min-w-11 items-center justify-center"
          onPress={onNextMonth}
        >
          <Text className="font-sans-semibold text-lg text-mindful-brown">›</Text>
        </Pressable>
      </View>

      <View className="mb-2 flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-1">
            <Text className="font-sans text-xs text-mindful-brown/60">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, index) => (
          <View key={`${year}-${month}-${index}`} className="w-[14.28%] items-center py-1">
            {day ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Dia ${day}`}
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
