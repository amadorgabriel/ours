import { useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';

import type { ReminderSettings } from '@/core/domain/device';
import { acknowledgeReminderNow } from '@/core/infra/storage/reminder-storage';
import { loadReminderSettings } from '@/core/infra/notifications/notification-service';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useNotificationActions } from '@/presentation/providers/notifications';

const DAY_MS = 24 * 60 * 60 * 1000;

function isReminderDue(settings: ReminderSettings): boolean {
  if (!settings.enabled) {
    return false;
  }

  const lastAck = settings.lastAcknowledgedAt
    ? new Date(settings.lastAcknowledgedAt).getTime()
    : 0;
  const now = Date.now();

  switch (settings.frequency) {
    case 'weekly':
      return now - lastAck >= 7 * DAY_MS;
    case 'monthly':
      return now - lastAck >= 28 * DAY_MS;
    case 'custom': {
      const days = settings.customIntervalDays ?? 7;
      return now - lastAck >= days * DAY_MS;
    }
    case 'daily':
    default:
      return now - lastAck >= DAY_MS;
  }
}

export function usePendingReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function evaluate() {
      const settings = await loadReminderSettings();
      setVisible(isReminderDue(settings));
    }

    void evaluate();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void evaluate();
      }
    });

    return () => subscription.remove();
  }, []);

  async function acknowledge() {
    await acknowledgeReminderNow();
    setVisible(false);
  }

  return { visible, acknowledge };
}

type InAppReminderBannerProps = {
  onCallNow: () => void;
};

export function InAppReminderBanner({ onCallNow }: InAppReminderBannerProps) {
  const { t } = useTranslation();
  const { visible, acknowledge } = usePendingReminder();

  if (!visible) {
    return null;
  }

  return (
    <View className="mx-4 mb-2 rounded-2xl bg-serenity-green/15 px-4 py-3">
      <Text className="font-sans-semibold text-mindful-brown">{t('reminder.title')}</Text>
      <Text className="mt-1 font-sans text-sm text-mindful-brown/80">{t('reminder.description')}</Text>
      <View className="mt-3 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reminder.callNowAccessibility')}
          className="rounded-xl bg-serenity-green px-4 py-2"
          onPress={() => {
            void acknowledge();
            onCallNow();
          }}
        >
          <Text className="font-sans-semibold text-light">{t('reminder.callNow')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reminder.dismissAccessibility')}
          className="rounded-xl border border-mindful-brown/20 px-4 py-2"
          onPress={() => {
            void acknowledge();
          }}
        >
          <Text className="font-sans-semibold text-mindful-brown">{t('reminder.dismiss')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function InAppReminderBannerHost() {
  const { requestCallNow } = useNotificationActions();

  return <InAppReminderBanner onCallNow={requestCallNow} />;
}
