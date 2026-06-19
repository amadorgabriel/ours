export type MonthRange = {
  from: string;
  to: string;
};

export function getMonthRange(year: number, month: number): MonthRange {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function toLocalDateKey(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function groupActivitiesByLocalDay<T extends { createdAt: string }>(
  items: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = toLocalDateKey(item.createdAt);
    const existing = grouped.get(key) ?? [];
    existing.push(item);
    grouped.set(key, existing);
  }

  return grouped;
}

export function getDaysWithActivities(items: { createdAt: string }[]): Set<number> {
  const days = new Set<number>();

  for (const item of items) {
    days.add(new Date(item.createdAt).getDate());
  }

  return days;
}

export function getActivityCountByDay(items: { createdAt: string }[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const item of items) {
    const day = new Date(item.createdAt).getDate();
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  return counts;
}
