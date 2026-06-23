import {
  addCalendarDays,
  formatCalendarDayLabel,
  isCalendarDayBeforeFamilyCreation,
  isCalendarDayEnabled,
} from '../calendar-day';

describe('calendar-day', () => {
  const familyCreatedAt = '2026-06-15T18:30:00.000Z';

  it('marks days before family creation as disabled', () => {
    expect(
      isCalendarDayBeforeFamilyCreation({ year: 2026, month: 6, day: 14 }, familyCreatedAt)
    ).toBe(true);
    expect(
      isCalendarDayEnabled({ year: 2026, month: 6, day: 14 }, familyCreatedAt)
    ).toBe(false);
  });

  it('keeps family creation day and later days enabled', () => {
    expect(
      isCalendarDayBeforeFamilyCreation({ year: 2026, month: 6, day: 15 }, familyCreatedAt)
    ).toBe(false);
    expect(
      isCalendarDayEnabled({ year: 2026, month: 6, day: 16 }, familyCreatedAt)
    ).toBe(true);
  });

  it('does not disable days when createdAt is missing', () => {
    expect(isCalendarDayBeforeFamilyCreation({ year: 2026, month: 1, day: 1 })).toBe(false);
  });

  it('adds days across month boundaries', () => {
    expect(addCalendarDays({ year: 2026, month: 6, day: 1 }, -1)).toEqual({
      year: 2026,
      month: 5,
      day: 31,
    });
    expect(addCalendarDays({ year: 2026, month: 6, day: 30 }, 1)).toEqual({
      year: 2026,
      month: 7,
      day: 1,
    });
  });

  it('formats day label in pt-BR', () => {
    expect(formatCalendarDayLabel({ year: 2026, month: 6, day: 18 })).toContain('junho');
  });
});
