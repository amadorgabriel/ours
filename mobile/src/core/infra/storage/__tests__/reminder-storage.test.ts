import * as SecureStore from 'expo-secure-store';

import { DEFAULT_REMINDER_TIME } from '@/core/domain/device';

import { getReminderSettings, setReminderSettings } from '../reminder-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('reminder-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns defaults when storage is empty', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await expect(getReminderSettings()).resolves.toEqual({
      enabled: false,
      time: DEFAULT_REMINDER_TIME,
    });
  });

  it('persists reminder settings', async () => {
    const settings = { enabled: true, time: { hour: 18, minute: 0 } };

    await setReminderSettings(settings);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'po_reminder_settings',
      JSON.stringify(settings)
    );
  });

  it('reads stored reminder settings', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
      JSON.stringify({ enabled: true, time: { hour: 12, minute: 0 } })
    );

    await expect(getReminderSettings()).resolves.toEqual({
      enabled: true,
      time: { hour: 12, minute: 0 },
    });
  });
});
