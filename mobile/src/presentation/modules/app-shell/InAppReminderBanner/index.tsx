import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, Text, View } from 'react-native';

import type { ReminderSettings } from '@/core/domain/device';
import { acknowledgeReminderNow } from '@/core/infra/storage/reminder-storage';
import { loadReminderSettings } from '@/core/infra/notifications/notification-service';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAuth } from '@/presentation/providers/auth';
import { useNotificationActions } from '@/presentation/providers/notifications';
import { colors } from '@/presentation/styles/tokens';

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
  const { session } = useAuth();
  const userId = session?.user.id;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!userId) {
      setVisible(false);
      return;
    }

    async function evaluate() {
      const settings = await loadReminderSettings(userId);
      setVisible(isReminderDue(settings));
    }

    void evaluate();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void evaluate();
      }
    });

    return () => subscription.remove();
  }, [userId]);

  async function acknowledge() {
    if (!userId) {
      return;
    }

    await acknowledgeReminderNow(userId);
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
    <View
      className="mx-4 rounded-2xl border border-serenity-green/25 bg-white px-4 py-3"
      pointerEvents="auto"
      style={
        Platform.OS === 'android'
          ? { elevation: 8 }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
            }
      }
    >
      <View className="flex-row items-start">
        <View className="mr-3 mt-0.5 h-9 w-9 items-center justify-center rounded-full bg-serenity-green/15">
          <Ionicons color={colors.serenityGreen60} name="call-outline" size={18} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-mindful-brown">{t('reminder.title')}</Text>
          <Text className="mt-1 font-sans text-sm text-mindful-brown/75">
            {t('reminder.description')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reminder.dismissAccessibility')}
          className="ml-2 rounded-full p-1"
          hitSlop={8}
          onPress={() => {
            void acknowledge();
          }}
        >
          <Ionicons color={colors.mindfulBrown60} name="close" size={20} />
        </Pressable>
      </View>
      <View className="mt-3 flex-row gap-2 pl-12">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reminder.callNowAccessibility')}
          className="flex-1 items-center rounded-xl bg-serenity-green py-2.5"
          onPress={() => {
            void acknowledge();
            onCallNow();
          }}
        >
          <Text className="font-sans-semibold text-sm text-light">{t('reminder.callNow')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reminder.dismissAccessibility')}
          className="items-center rounded-xl border border-mindful-brown/15 px-4 py-2.5"
          onPress={() => {
            void acknowledge();
          }}
        >
          <Text className="font-sans-semibold text-sm text-mindful-brown">{t('reminder.dismiss')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function InAppReminderBannerHost() {
  const { requestCallNow } = useNotificationActions();

  return (
    <View className="absolute inset-x-0 top-2 z-50" pointerEvents="box-none">
      <InAppReminderBanner onCallNow={requestCallNow} />
    </View>
  );
}
