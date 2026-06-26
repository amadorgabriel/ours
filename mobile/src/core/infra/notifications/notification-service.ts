import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DevicePlatform, ReminderSettings, ReminderTime } from '@/core/domain/device';

import {
  buildDailyReminderContent,
  buildReminderTrigger,
  getDailyReminderIdentifier,
} from './local-reminder';
import { getReminderSettings, setReminderSettings } from '../storage/reminder-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function getDevicePlatform(): DevicePlatform {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted ?? false;
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export async function loadReminderSettings(userId: string): Promise<ReminderSettings> {
  return getReminderSettings(userId);
}

export async function saveReminderSettings(
  userId: string,
  settings: ReminderSettings
): Promise<void> {
  await setReminderSettings(userId, settings);

  if (!settings.enabled) {
    await cancelDailyCallReminder();
    return;
  }

  await scheduleCallReminder(settings);
}

export async function syncReminderScheduleForUser(userId: string): Promise<void> {
  const settings = await getReminderSettings(userId);

  if (!settings.enabled) {
    await cancelDailyCallReminder();
    return;
  }

  await scheduleCallReminder(settings);
}

export async function scheduleCallReminder(settings: ReminderSettings): Promise<void> {
  await cancelDailyCallReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: getDailyReminderIdentifier(),
    content: buildDailyReminderContent(),
    trigger: buildReminderTrigger(settings),
  });
}

export async function scheduleDailyCallReminder(time: ReminderTime): Promise<void> {
  await scheduleCallReminder({
    enabled: true,
    time,
    frequency: 'daily',
  });
}

export async function cancelDailyCallReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(getDailyReminderIdentifier());
}

export function isCallReminderNotification(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return (data as { action?: string }).action === 'call-now';
}
