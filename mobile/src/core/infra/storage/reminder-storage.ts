import * as SecureStore from 'expo-secure-store';

import type { ReminderFrequency, ReminderSettings, ReminderTime } from '@/core/domain/device';
import {
  DEFAULT_CUSTOM_INTERVAL_DAYS,
  DEFAULT_DAY_OF_MONTH,
  DEFAULT_REMINDER_FREQUENCY,
  DEFAULT_REMINDER_TIME,
  DEFAULT_WEEKDAY,
} from '@/core/domain/device';

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

function isReminderFrequency(value: unknown): value is ReminderFrequency {
  return value === 'daily' || value === 'weekly' || value === 'monthly' || value === 'custom';
}

function normalizeSettings(parsed: Partial<ReminderSettings>): ReminderSettings {
  return {
    enabled: Boolean(parsed.enabled),
    time: isReminderTime(parsed.time) ? parsed.time : DEFAULT_REMINDER_TIME,
    frequency: isReminderFrequency(parsed.frequency) ? parsed.frequency : DEFAULT_REMINDER_FREQUENCY,
    customIntervalDays: parsed.customIntervalDays ?? DEFAULT_CUSTOM_INTERVAL_DAYS,
    weekday: parsed.weekday ?? DEFAULT_WEEKDAY,
    dayOfMonth: parsed.dayOfMonth ?? DEFAULT_DAY_OF_MONTH,
    lastAcknowledgedAt: parsed.lastAcknowledgedAt,
  };
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await SecureStore.getItemAsync(REMINDER_SETTINGS_KEY);
    if (!raw) {
      return normalizeSettings({ enabled: false, time: DEFAULT_REMINDER_TIME });
    }

    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return normalizeSettings(parsed);
  } catch {
    return normalizeSettings({ enabled: false, time: DEFAULT_REMINDER_TIME });
  }
}

export async function setReminderSettings(settings: ReminderSettings): Promise<void> {
  await SecureStore.setItemAsync(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
}

export async function acknowledgeReminderNow(): Promise<ReminderSettings> {
  const current = await getReminderSettings();
  const next = { ...current, lastAcknowledgedAt: new Date().toISOString() };
  await setReminderSettings(next);
  return next;
}
