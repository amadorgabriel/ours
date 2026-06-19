import * as SecureStore from 'expo-secure-store';

import type { ReminderSettings, ReminderTime } from '@/core/domain/device';
import { DEFAULT_REMINDER_TIME } from '@/core/domain/device';

const REMINDER_SETTINGS_KEY = 'po_reminder_settings';

function isReminderTime(value: unknown): value is ReminderTime {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as ReminderTime;
  return (
    typeof candidate.hour === 'number' &&
    candidate.hour >= 0 &&
    candidate.hour <= 23 &&
    typeof candidate.minute === 'number' &&
    candidate.minute >= 0 &&
    candidate.minute <= 59
  );
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await SecureStore.getItemAsync(REMINDER_SETTINGS_KEY);
    if (!raw) {
      return { enabled: false, time: DEFAULT_REMINDER_TIME };
    }

    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      time: isReminderTime(parsed.time) ? parsed.time : DEFAULT_REMINDER_TIME,
    };
  } catch {
    return { enabled: false, time: DEFAULT_REMINDER_TIME };
  }
}

export async function setReminderSettings(settings: ReminderSettings): Promise<void> {
  await SecureStore.setItemAsync(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
}
