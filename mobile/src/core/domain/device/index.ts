export type DevicePlatform = 'ios' | 'android';

export type Device = {
  id: string;
  pushToken: string;
  platform: DevicePlatform;
  updatedAt: string;
};

export type RegisterDeviceRequest = {
  pushToken: string;
  platform: DevicePlatform;
};

export type RegisterDeviceResponse = Device;

export type ReminderTime = {
  hour: number;
  minute: number;
};

export type ReminderFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export type ReminderSettings = {
  enabled: boolean;
  time: ReminderTime;
  frequency: ReminderFrequency;
  customIntervalDays?: number;
  weekday?: number;
  dayOfMonth?: number;
  lastAcknowledgedAt?: string;
};

export const DEFAULT_REMINDER_FREQUENCY: ReminderFrequency = 'daily';
export const DEFAULT_CUSTOM_INTERVAL_DAYS = 7;
export const DEFAULT_WEEKDAY = 1;
export const DEFAULT_DAY_OF_MONTH = 1;

export const DEFAULT_REMINDER_TIME: ReminderTime = { hour: 9, minute: 0 };

export const REMINDER_TIME_OPTIONS: ReminderTime[] = [
  { hour: 8, minute: 0 },
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 20, minute: 0 },
];

export function formatReminderTime(time: ReminderTime): string {
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}
