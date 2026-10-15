import { parseLocalDateInput } from '@/core/services/usecases/activity/month-range';

export type VisitScheduleError = 'invalidStart' | 'invalidEnd' | 'endBeforeStart';

export type VisitSchedule =
  | { ok: true; startAt: string; endAt?: string }
  | { ok: false; error: VisitScheduleError };

export function buildVisitSchedule(input: {
  allDay: boolean;
  startDate: string;
  endDate: string;
}): VisitSchedule {
  const start = parseLocalDateInput(input.startDate);
  if (!start) {
    return { ok: false, error: 'invalidStart' };
  }

  let end: Date | undefined;
  if (!input.allDay) {
    const parsedEnd = parseLocalDateInput(input.endDate);
    if (!parsedEnd) {
      return { ok: false, error: 'invalidEnd' };
    }

    if (parsedEnd < start) {
      return { ok: false, error: 'endBeforeStart' };
    }

    end = parsedEnd;
  }

  const startAt = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
  const endAt = end
    ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
    : undefined;

  return {
    ok: true,
    startAt: startAt.toISOString(),
    endAt: endAt?.toISOString(),
  };
}
