export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export function toLocalCalendarDate(isoDate: string): CalendarDate {
  const date = new Date(isoDate);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function toCalendarDateKey({ year, month, day }: CalendarDate): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatCalendarDayLabel({ year, month, day }: CalendarDate): string {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function addCalendarDays(
  { year, month, day }: CalendarDate,
  delta: number
): CalendarDate {
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function getFamilyCreatedLocalDate(familyCreatedAt?: string): CalendarDate | null {
  if (!familyCreatedAt) {
    return null;
  }

  return toLocalCalendarDate(familyCreatedAt);
}

export function isCalendarDayBeforeFamilyCreation(
  date: CalendarDate,
  familyCreatedAt?: string
): boolean {
  const created = getFamilyCreatedLocalDate(familyCreatedAt);
  if (!created) {
    return false;
  }

  const target = new Date(date.year, date.month - 1, date.day);
  const createdLocal = new Date(created.year, created.month - 1, created.day);

  return target < createdLocal;
}

export function isCalendarDayEnabled(
  date: CalendarDate,
  familyCreatedAt?: string
): boolean {
  return !isCalendarDayBeforeFamilyCreation(date, familyCreatedAt);
}
