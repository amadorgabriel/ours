import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';

import {
  DEFAULT_CUSTOM_INTERVAL_DAYS,
  DEFAULT_REMINDER_FREQUENCY,
  DEFAULT_REMINDER_TIME,
  formatReminderTime,
  REMINDER_TIME_OPTIONS,
  type ReminderFrequency,
  type ReminderSettings,
  type ReminderTime,
} from '@/core/domain/device';
import {
  getDevicePlatform,
  getExpoPushToken,
  loadReminderSettings,
  requestNotificationPermission,
  saveReminderSettings,
} from '@/core/infra/notifications/notification-service';
import { useRegisterDevice } from '@/core/services/usecases/device/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAuth } from '@/presentation/providers/auth';
import { colors } from '@/presentation/styles/tokens';

const CUSTOM_INTERVAL_OPTIONS = [2, 3, 5, 7, 14, 30];

export function NotificationSettings() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const userId = session?.user.id;
  const registerDevice = useRegisterDevice();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    time: DEFAULT_REMINDER_TIME,
    frequency: DEFAULT_REMINDER_FREQUENCY,
    customIntervalDays: DEFAULT_CUSTOM_INTERVAL_DAYS,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const frequencyOptions: { value: ReminderFrequency; labelKey: string }[] = [
    { value: 'daily', labelKey: 'notifications.frequencyDaily' },
    { value: 'weekly', labelKey: 'notifications.frequencyWeekly' },
    { value: 'monthly', labelKey: 'notifications.frequencyMonthly' },
    { value: 'custom', labelKey: 'notifications.frequencyCustom' },
  ];

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    void loadReminderSettings(userId).then((loaded) => {
      setSettings(loaded);
      setLoading(false);
    });
  }, [userId]);

  async function persistSettings(next: ReminderSettings, message: string) {
    if (!userId) {
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      await saveReminderSettings(userId, next);
      setSettings(next);
      setStatusMessage(message);
    } catch {
      setStatusMessage(t('errors.notifications.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(nextEnabled: boolean) {
    if (nextEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setStatusMessage(t('errors.notifications.permissionDenied'));
        setSettings((current) => ({ ...current, enabled: false }));
        return;
      }

      const pushToken = await getExpoPushToken();
      if (pushToken) {
        await registerDevice.mutateAsync({
          pushToken,
          platform: getDevicePlatform(),
        });
      }

      await persistSettings({ ...settings, enabled: true }, t('notifications.reminderEnabled'));
      return;
    }

    await persistSettings({ ...settings, enabled: false }, t('notifications.reminderDisabled'));
  }

  async function updateSettings(patch: Partial<ReminderSettings>, message: string) {
    const next = { ...settings, ...patch };
    setSettings(next);

    if (!next.enabled) {
      return;
    }

    await persistSettings(next, message);
  }

  if (loading) {
    return (
      <View className="mt-4 items-center rounded-2xl bg-mindful-brown/10 p-5">
        <ActivityIndicator color={colors.mindfulBrown60} />
      </View>
    );
  }

  return (
    <View className="mt-4 rounded-2xl bg-mindful-brown/10 p-5">
      <Text className="font-sans-semibold text-lg text-mindful-brown/60">{t('notifications.title')}</Text>
      <Text className="mt-1 font-sans text-sm text-mindful-brown/50">{t('notifications.description')}</Text>

      <View className="mt-4 flex-row items-center justify-between rounded-xl bg-mindful-brown/8 px-4 py-3">
        <View className="flex-1 pr-4">
          <Text className="font-sans text-sm text-mindful-brown/60">{t('notifications.reminders')}</Text>
        </View>
        <Switch
          accessibilityLabel={t('notifications.remindersAccessibility')}
          disabled={saving}
          trackColor={{ false: colors.mindfulBrown60, true: colors.serenityGreen60 }}
          thumbColor={colors.textLight}
          value={settings.enabled}
          onValueChange={(value) => {
            void handleToggle(value);
          }}
        />
      </View>

      {settings.enabled ? (
        <>
          <View className="mt-4">
            <Text className="font-sans text-sm text-mindful-brown/50">{t('notifications.frequency')}</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {frequencyOptions.map((option) => {
                const label = t(option.labelKey);
                const isSelected = settings.frequency === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={isSelected ? { selected: true } : {}}
                    className={`rounded-full px-3 py-2 ${isSelected ? 'bg-serenity-green' : 'bg-cream'}`}
                    disabled={saving}
                    onPress={() => {
                      void updateSettings(
                        { frequency: option.value },
                        t('notifications.frequencyUpdated', { label })
                      );
                    }}
                  >
                    <Text
                      className={`font-sans-semibold text-sm ${
                        isSelected ? 'text-light' : 'text-mindful-brown'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {settings.frequency === 'custom' ? (
            <View className="mt-4">
              <Text className="font-sans text-sm text-mindful-brown/50">
                {t('notifications.customInterval')}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {CUSTOM_INTERVAL_OPTIONS.map((days) => {
                  const isSelected = settings.customIntervalDays === days;
                  return (
                    <Pressable
                      key={days}
                      accessibilityRole="button"
                      accessibilityLabel={t('notifications.customIntervalAccessibility', { days })}
                      className={`rounded-full px-3 py-2 ${isSelected ? 'bg-serenity-green' : 'bg-cream'}`}
                      disabled={saving}
                      onPress={() => {
                        void updateSettings(
                          { customIntervalDays: days },
                          t('notifications.reminderEveryDays', { days })
                        );
                      }}
                    >
                      <Text
                        className={`font-sans-semibold text-sm ${
                          isSelected ? 'text-light' : 'text-mindful-brown'
                        }`}
                      >
                        {t('notifications.customIntervalDays', { days })}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View className="mt-4">
            <Text className="font-sans text-sm text-mindful-brown/50">
              {t('notifications.reminderTime')}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {REMINDER_TIME_OPTIONS.map((time: ReminderTime) => {
                const label = formatReminderTime(time);
                const isSelected =
                  time.hour === settings.time.hour && time.minute === settings.time.minute;

                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={t('notifications.reminderTimeAccessibility', { time: label })}
                    accessibilityState={isSelected ? { selected: true } : {}}
                    className={`rounded-full px-3 py-2 ${
                      isSelected ? 'bg-serenity-green' : 'bg-cream'
                    }`}
                    disabled={saving}
                    onPress={() => {
                      void updateSettings({ time }, t('notifications.reminderScheduled', { time: label }));
                    }}
                  >
                    <Text
                      className={`font-sans-semibold text-sm ${
                        isSelected ? 'text-light' : 'text-mindful-brown'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      ) : null}

      {statusMessage ? (
        <Text className="mt-3 font-sans text-sm text-mindful-brown/50">{statusMessage}</Text>
      ) : null}
    </View>
  );
}
