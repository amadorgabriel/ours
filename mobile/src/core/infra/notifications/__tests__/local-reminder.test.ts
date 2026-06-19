import { DEFAULT_REMINDER_TIME } from '@/core/domain/device';

import {
  buildDailyReminderContent,
  buildDailyReminderTrigger,
  getDailyReminderIdentifier,
} from '../local-reminder';

describe('local-reminder', () => {
  it('builds daily trigger with selected time', () => {
    expect(buildDailyReminderTrigger({ hour: 9, minute: 30 })).toEqual({
      type: 'daily',
      hour: 9,
      minute: 30,
    });
  });

  it('builds reminder content with call action', () => {
    expect(buildDailyReminderContent()).toEqual({
      title: 'Hora de ligar',
      body: 'Reserve um momento para ligar para o assistido.',
      data: { action: 'call-now' },
    });
  });

  it('returns stable reminder identifier', () => {
    expect(getDailyReminderIdentifier()).toBe('daily-call-reminder');
    expect(DEFAULT_REMINDER_TIME).toEqual({ hour: 9, minute: 0 });
  });
});
