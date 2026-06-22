import * as Notifications from 'expo-notifications';

import type { ReminderSettings, ReminderTime } from '@/core/domain/device';
import {
  DEFAULT_CUSTOM_INTERVAL_DAYS,
  DEFAULT_DAY_OF_MONTH,
  DEFAULT_WEEKDAY,
} from '@/core/domain/device';

import {
  CALL_REMINDER_NOTIFICATION_DATA,
  DAILY_CALL_REMINDER_ID,
} from './notification-ids';

export function buildDailyReminderTrigger(time: ReminderTime): Notifications.DailyTriggerInput {
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: time.hour,
    minute: time.minute,
  };
}

export function buildReminderTrigger(
  settings: ReminderSettings
): Notifications.NotificationTriggerInput {
  const { time, frequency } = settings;

  switch (frequency) {
    case 'weekly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: settings.weekday ?? DEFAULT_WEEKDAY,
        hour: time.hour,
        minute: time.minute,
      };
    case 'monthly':
      return {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: settings.dayOfMonth ?? DEFAULT_DAY_OF_MONTH,
        hour: time.hour,
        minute: time.minute,
      };
    case 'custom': {
      const days = settings.customIntervalDays ?? DEFAULT_CUSTOM_INTERVAL_DAYS;
      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: days * 24 * 60 * 60,
        repeats: true,
      };
    }
    case 'daily':
    default:
      return buildDailyReminderTrigger(time);
  }
}

export function buildDailyReminderContent() {
  return {
    title: 'Hora de ligar',
    body: 'Reserve um momento para ligar para o assistido.',
    data: CALL_REMINDER_NOTIFICATION_DATA,
  };
}

export function getDailyReminderIdentifier() {
  return DAILY_CALL_REMINDER_ID;
}
