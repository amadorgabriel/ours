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

export function formatLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseLocalDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
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
