import { canEditActivity, isWithinActivityEditWindow } from '../activity-edit-window';

describe('activity-edit-window', () => {
  it('returns true within 24 hours', () => {
    const createdAt = new Date('2026-06-23T10:00:00.000Z').toISOString();
    const now = new Date('2026-06-23T20:00:00.000Z').getTime();

    expect(isWithinActivityEditWindow(createdAt, now)).toBe(true);
  });

  it('returns false after 24 hours', () => {
    const createdAt = new Date('2026-06-22T10:00:00.000Z').toISOString();
    const now = new Date('2026-06-23T11:00:00.000Z').getTime();

    expect(isWithinActivityEditWindow(createdAt, now)).toBe(false);
  });

  it('allows edit only for author within window', () => {
    const createdAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    expect(canEditActivity('user-1', 'user-1', createdAt)).toBe(true);
    expect(canEditActivity('user-1', 'user-2', createdAt)).toBe(false);
    expect(canEditActivity('user-1', undefined, createdAt)).toBe(false);
  });
});
