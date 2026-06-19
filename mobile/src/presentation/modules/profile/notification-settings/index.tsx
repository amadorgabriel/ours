import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';

import {
  DEFAULT_REMINDER_TIME,
  formatReminderTime,
  REMINDER_TIME_OPTIONS,
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

export function NotificationSettings() {
  const registerDevice = useRegisterDevice();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState<ReminderTime>(DEFAULT_REMINDER_TIME);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadReminderSettings().then((settings) => {
      setEnabled(settings.enabled);
      setSelectedTime(settings.time);
      setLoading(false);
    });
  }, []);

  async function handleToggle(nextEnabled: boolean) {
    setSaving(true);
    setStatusMessage(null);

    try {
      if (nextEnabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          setStatusMessage('Permissão negada. Você pode ativar depois nas configurações do sistema.');
          setEnabled(false);
          return;
        }

        const pushToken = await getExpoPushToken();
        if (pushToken) {
          await registerDevice.mutateAsync({
            pushToken,
            platform: getDevicePlatform(),
          });
        }

        await saveReminderSettings({ enabled: true, time: selectedTime });
        setEnabled(true);
        setStatusMessage('Lembrete diário ativado.');
        return;
      }

      await saveReminderSettings({ enabled: false, time: selectedTime });
      setEnabled(false);
      setStatusMessage('Lembretes desativados.');
    } catch {
      setStatusMessage('Não foi possível atualizar as notificações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectTime(time: ReminderTime) {
    setSelectedTime(time);
    if (!enabled) {
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      await saveReminderSettings({ enabled: true, time });
      setStatusMessage(`Lembrete agendado para ${formatReminderTime(time)}.`);
    } catch {
      setStatusMessage('Não foi possível atualizar o horário.');
    } finally {
      setSaving(false);
    }
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
        Receba um lembrete diário para ligar para o assistido.
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="font-sans text-mindful-brown">Lembrete diário</Text>
        <Switch
          accessibilityLabel="Ativar lembrete diário"
          disabled={saving}
          value={enabled}
          onValueChange={(value) => {
            void handleToggle(value);
          }}
        />
      </View>

      {enabled ? (
        <View className="mt-4">
          <Text className="font-sans text-sm text-mindful-brown/70">Horário do lembrete</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {REMINDER_TIME_OPTIONS.map((time) => {
              const label = formatReminderTime(time);
              const isSelected =
                time.hour === selectedTime.hour && time.minute === selectedTime.minute;

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
                    void handleSelectTime(time);
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
      ) : null}

      {statusMessage ? (
        <Text className="mt-3 font-sans text-sm text-mindful-brown/70">{statusMessage}</Text>
      ) : null}
    </View>
  );
}
