'use client';

import { Text } from '@/ui/DataDisplay/Text';
import { Button } from '@/ui/DataDisplay/Button';

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
  activityCountByDay: Map<number, number>;
  onDayPress: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  prevMonthLabel: string;
  nextMonthLabel: string;
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
  activityCountByDay,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  prevMonthLabel,
  nextMonthLabel,
}: CalendarGridProps) {
  const cells = buildCalendarDays(year, month);
  const monthLabel = `${MONTH_LABELS[month - 1]} ${year}`;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="subtle"
          size="compact-sm"
          aria-label={prevMonthLabel}
          onClick={onPrevMonth}
        >
          ‹
        </Button>
        <Text fw={600} size="lg">
          {monthLabel}
        </Text>
        <Button
          variant="subtle"
          size="compact-sm"
          aria-label={nextMonthLabel}
          onClick={onNextMonth}
        >
          ›
        </Button>
      </div>

      <div className="mb-2 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-center">
            <Text size="xs" c="dimmed">
              {label}
            </Text>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const count = day ? activityCountByDay.get(day) ?? 0 : 0;

          return (
            <div key={`${year}-${month}-${index}`} className="flex items-center justify-center py-1">
              {day ? (
                <button
                  type="button"
                  aria-label={`Dia ${day}${count > 0 ? `, ${count} atividades` : ''}`}
                  className="flex min-h-11 min-w-11 flex-col items-center justify-center rounded-full transition-colors hover:bg-black/5"
                  onClick={() => onDayPress(day)}
                >
                  <Text size="sm">{day}</Text>
                  {count > 0 ? (
                    <Text size="xs" c="green" fw={600}>
                      {count}
                    </Text>
                  ) : (
                    <span className="h-4" aria-hidden />
                  )}
                </button>
              ) : (
                <span className="min-h-11 min-w-11" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
