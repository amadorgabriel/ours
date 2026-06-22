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
import { colors } from '@/presentation/styles/tokens';

const FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string }[] = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'custom', label: 'Personalizada' },
];

const CUSTOM_INTERVAL_OPTIONS = [2, 3, 5, 7, 14, 30];

export function NotificationSettings() {
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

  useEffect(() => {
    void loadReminderSettings().then((loaded) => {
      setSettings(loaded);
      setLoading(false);
    });
  }, []);

  async function persistSettings(next: ReminderSettings, message: string) {
    setSaving(true);
    setStatusMessage(null);

    try {
      await saveReminderSettings(next);
      setSettings(next);
      setStatusMessage(message);
    } catch {
      setStatusMessage('Não foi possível atualizar as notificações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(nextEnabled: boolean) {
    if (nextEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setStatusMessage('Permissão negada. Você pode ativar depois nas configurações do sistema.');
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

      await persistSettings({ ...settings, enabled: true }, 'Lembrete ativado.');
      return;
    }

    await persistSettings({ ...settings, enabled: false }, 'Lembretes desativados.');
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
      <View className="mt-4 items-center rounded-2xl bg-white p-5">
        <ActivityIndicator color={colors.serenityGreen60} />
      </View>
    );
  }

  return (
    <View className="mt-4 rounded-2xl bg-white p-5">
      <Text className="font-sans-semibold text-lg text-mindful-brown">Notificações</Text>
      <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
        Receba lembretes para ligar para o assistido.
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="font-sans text-mindful-brown">Lembretes</Text>
        <Switch
          accessibilityLabel="Ativar lembretes"
          disabled={saving}
          value={settings.enabled}
          onValueChange={(value) => {
            void handleToggle(value);
          }}
        />
      </View>

      {settings.enabled ? (
        <>
          <View className="mt-4">
            <Text className="font-sans text-sm text-mindful-brown/70">Periodicidade</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((option) => {
                const isSelected = settings.frequency === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={isSelected ? { selected: true } : {}}
                    className={`rounded-full px-3 py-2 ${isSelected ? 'bg-serenity-green' : 'bg-cream'}`}
                    disabled={saving}
                    onPress={() => {
                      void updateSettings({ frequency: option.value }, `Periodicidade: ${option.label}.`);
                    }}
                  >
                    <Text
                      className={`font-sans-semibold text-sm ${
                        isSelected ? 'text-light' : 'text-mindful-brown'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {settings.frequency === 'custom' ? (
            <View className="mt-4">
              <Text className="font-sans text-sm text-mindful-brown/70">A cada quantos dias?</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {CUSTOM_INTERVAL_OPTIONS.map((days) => {
                  const isSelected = settings.customIntervalDays === days;
                  return (
                    <Pressable
                      key={days}
                      accessibilityRole="button"
                      accessibilityLabel={`${days} dias`}
                      className={`rounded-full px-3 py-2 ${isSelected ? 'bg-serenity-green' : 'bg-cream'}`}
                      disabled={saving}
                      onPress={() => {
                        void updateSettings(
                          { customIntervalDays: days },
                          `Lembrete a cada ${days} dias.`
                        );
                      }}
                    >
                      <Text
                        className={`font-sans-semibold text-sm ${
                          isSelected ? 'text-light' : 'text-mindful-brown'
                        }`}
                      >
                        {days}d
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View className="mt-4">
            <Text className="font-sans text-sm text-mindful-brown/70">Horário do lembrete</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {REMINDER_TIME_OPTIONS.map((time) => {
                const label = formatReminderTime(time);
                const isSelected =
                  time.hour === settings.time.hour && time.minute === settings.time.minute;

                return (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityLabel={`Horário ${label}`}
                    accessibilityState={isSelected ? { selected: true } : {}}
                    className={`rounded-full px-3 py-2 ${
                      isSelected ? 'bg-serenity-green' : 'bg-cream'
                    }`}
                    disabled={saving}
                    onPress={() => {
                      void updateSettings({ time }, `Lembrete agendado para ${label}.`);
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
        <Text className="mt-3 font-sans text-sm text-mindful-brown/70">{statusMessage}</Text>
      ) : null}
    </View>
  );
}
