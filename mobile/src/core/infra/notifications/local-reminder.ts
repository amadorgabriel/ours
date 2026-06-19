import * as Notifications from 'expo-notifications';

import type { ReminderTime } from '@/core/domain/device';

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
