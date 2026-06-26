import * as SecureStore from 'expo-secure-store';

import {
  DEFAULT_CUSTOM_INTERVAL_DAYS,
  DEFAULT_DAY_OF_MONTH,
  DEFAULT_REMINDER_FREQUENCY,
  DEFAULT_REMINDER_TIME,
  DEFAULT_WEEKDAY,
} from '@/core/domain/device';

import { getReminderSettings, setReminderSettings } from '../reminder-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('reminder-storage', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns defaults when storage is empty', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await expect(getReminderSettings(userId)).resolves.toEqual({
      enabled: false,
      time: DEFAULT_REMINDER_TIME,
      frequency: DEFAULT_REMINDER_FREQUENCY,
      customIntervalDays: DEFAULT_CUSTOM_INTERVAL_DAYS,
      weekday: DEFAULT_WEEKDAY,
      dayOfMonth: DEFAULT_DAY_OF_MONTH,
      lastAcknowledgedAt: undefined,
    });
  });

  it('persists reminder settings per user', async () => {
    const settings = {
      enabled: true,
      time: { hour: 18, minute: 0 },
      frequency: 'daily' as const,
    };

    await setReminderSettings(userId, settings);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'po_reminder_settings:user-1',
      JSON.stringify(settings)
    );
  });

  it('reads stored reminder settings for user', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'po_reminder_settings:user-1') {
        return Promise.resolve(JSON.stringify({ enabled: true, time: { hour: 12, minute: 0 } }));
      }

      return Promise.resolve(null);
    });

    await expect(getReminderSettings(userId)).resolves.toEqual({
      enabled: true,
      time: { hour: 12, minute: 0 },
      frequency: DEFAULT_REMINDER_FREQUENCY,
      customIntervalDays: DEFAULT_CUSTOM_INTERVAL_DAYS,
      weekday: DEFAULT_WEEKDAY,
      dayOfMonth: DEFAULT_DAY_OF_MONTH,
      lastAcknowledgedAt: undefined,
    });
  });

  it('migrates legacy reminder settings to the active user', async () => {
    const legacySettings = JSON.stringify({ enabled: true, time: { hour: 10, minute: 30 } });

    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'po_reminder_settings:user-1') {
        return Promise.resolve(null);
      }

      if (key === 'po_reminder_settings') {
        return Promise.resolve(legacySettings);
      }

      return Promise.resolve(null);
    });

    await expect(getReminderSettings(userId)).resolves.toEqual({
      enabled: true,
      time: { hour: 10, minute: 30 },
      frequency: DEFAULT_REMINDER_FREQUENCY,
      customIntervalDays: DEFAULT_CUSTOM_INTERVAL_DAYS,
      weekday: DEFAULT_WEEKDAY,
      dayOfMonth: DEFAULT_DAY_OF_MONTH,
      lastAcknowledgedAt: undefined,
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'po_reminder_settings:user-1',
      JSON.stringify({
        enabled: true,
        time: { hour: 10, minute: 30 },
        frequency: DEFAULT_REMINDER_FREQUENCY,
        customIntervalDays: DEFAULT_CUSTOM_INTERVAL_DAYS,
        weekday: DEFAULT_WEEKDAY,
        dayOfMonth: DEFAULT_DAY_OF_MONTH,
      })
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('po_reminder_settings');
  });
});
