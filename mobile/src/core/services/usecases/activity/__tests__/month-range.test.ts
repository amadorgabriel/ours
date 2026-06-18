import {
  getDaysWithActivities,
  getMonthRange,
  groupActivitiesByLocalDay,
  toLocalDateKey,
} from '../month-range';

describe('month-range', () => {
  it('builds local month range', () => {
    const range = getMonthRange(2026, 6);

    expect(range.from).toContain('2026-');
    expect(range.to).toContain('2026-');
    expect(new Date(range.from).getMonth()).toBe(5);
    expect(new Date(range.to).getDate()).toBe(30);
  });

  it('groups activities by local day', () => {
    const grouped = groupActivitiesByLocalDay([
      { createdAt: '2026-06-18T12:00:00.000Z' },
      { createdAt: '2026-06-18T18:00:00.000Z' },
      { createdAt: '2026-06-19T10:00:00.000Z' },
    ]);

    const dayKey = toLocalDateKey('2026-06-18T12:00:00.000Z');
    expect(grouped.get(dayKey)?.length).toBe(2);
  });

  it('extracts days with activities', () => {
    const days = getDaysWithActivities([
      { createdAt: '2026-06-18T12:00:00.000Z' },
      { createdAt: '2026-06-05T12:00:00.000Z' },
    ]);

    expect(days.has(18)).toBe(true);
    expect(days.has(5)).toBe(true);
  });
});
