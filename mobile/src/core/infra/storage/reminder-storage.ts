import * as SecureStore from 'expo-secure-store';

import type { ReminderFrequency, ReminderSettings, ReminderTime } from '@/core/domain/device';
import {
  DEFAULT_CUSTOM_INTERVAL_DAYS,
  DEFAULT_DAY_OF_MONTH,
  DEFAULT_REMINDER_FREQUENCY,
  DEFAULT_REMINDER_TIME,
  DEFAULT_WEEKDAY,
} from '@/core/domain/device';

const LEGACY_REMINDER_SETTINGS_KEY = 'po_reminder_settings';

function reminderSettingsKey(userId: string): string {
  return `po_reminder_settings:${userId}`;
}

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

async function readStoredSettings(key: string): Promise<ReminderSettings | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
  return normalizeSettings(parsed);
}

async function migrateLegacySettings(userId: string): Promise<ReminderSettings | null> {
  const legacy = await readStoredSettings(LEGACY_REMINDER_SETTINGS_KEY);
  if (!legacy) {
    return null;
  }

  await SecureStore.setItemAsync(reminderSettingsKey(userId), JSON.stringify(legacy));
  await SecureStore.deleteItemAsync(LEGACY_REMINDER_SETTINGS_KEY);
  return legacy;
}

export async function getReminderSettings(userId: string): Promise<ReminderSettings> {
  try {
    const stored = await readStoredSettings(reminderSettingsKey(userId));
    if (stored) {
      return stored;
    }

    const migrated = await migrateLegacySettings(userId);
    if (migrated) {
      return migrated;
    }

    return normalizeSettings({ enabled: false, time: DEFAULT_REMINDER_TIME });
  } catch {
    return normalizeSettings({ enabled: false, time: DEFAULT_REMINDER_TIME });
  }
}

export async function setReminderSettings(
  userId: string,
  settings: ReminderSettings
): Promise<void> {
  await SecureStore.setItemAsync(reminderSettingsKey(userId), JSON.stringify(settings));
}

export async function acknowledgeReminderNow(userId: string): Promise<ReminderSettings> {
  const current = await getReminderSettings(userId);
  const next = { ...current, lastAcknowledgedAt: new Date().toISOString() };
  await setReminderSettings(userId, next);
  return next;
}
