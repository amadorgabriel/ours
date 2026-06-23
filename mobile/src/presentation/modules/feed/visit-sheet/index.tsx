import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';

import { useRegisterVisit } from '@/core/services/usecases/activity/index.hooks';
import {
  formatLocalDateInput,
  parseLocalDateInput,
} from '@/core/services/usecases/activity/month-range';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAppAlert } from '@/presentation/providers/alert';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { DatePickerField } from '@/ui/Forms/DatePickerField';

type VisitSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function toIsoDateInput(date: Date): string {
  return formatLocalDateInput(date);
}

async function pickCompressedPhoto(
  onPermissionDenied: () => void
): Promise<{ base64: string; mimeType: string } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    onPermissionDenied();
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!manipulated.base64) {
    return null;
  }

  return {
    base64: `data:image/jpeg;base64,${manipulated.base64}`,
    mimeType: 'image/jpeg',
  };
}

export function VisitSheet({ visible, onClose }: VisitSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const { parentId, activeParent } = useAssistido();
  const registerVisit = useRegisterVisit();
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(toIsoDateInput(new Date()));
  const [endDate, setEndDate] = useState(toIsoDateInput(new Date()));
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | undefined>();

  function resetForm() {
    setAllDay(true);
    setStartDate(toIsoDateInput(new Date()));
    setEndDate(toIsoDateInput(new Date()));
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoMimeType(undefined);
    registerVisit.reset();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handlePickPhoto() {
    try {
      const photo = await pickCompressedPhoto(() => {
        alert(
          t('alerts.galleryPermission.title'),
          t('alerts.galleryPermission.visitMessage')
        );
      });
      if (!photo) return;

      setPhotoPreview(photo.base64);
      setPhotoBase64(photo.base64);
      setPhotoMimeType(photo.mimeType);
    } catch {
      alert(t('alerts.photoError.title'), t('alerts.photoError.processMessage'));
    }
  }

  function handleSubmit() {
    if (!parentId || !activeParent) {
      alert(
        t('alerts.visit.assistidoRequired.title'),
        t('alerts.visit.assistidoRequired.message')
      );
      return;
    }

    const start = parseLocalDateInput(startDate);
    if (!start) {
      alert(
        t('alerts.visit.invalidStartDate.title'),
        t('alerts.visit.invalidStartDate.message')
      );
      return;
    }

    let end: Date | undefined;
    if (!allDay) {
      const parsedEnd = parseLocalDateInput(endDate);
      if (!parsedEnd) {
        alert(
          t('alerts.visit.invalidEndDate.title'),
          t('alerts.visit.invalidEndDate.message')
        );
        return;
      }

      if (parsedEnd < start) {
        alert(
          t('alerts.visit.endBeforeStart.title'),
          t('alerts.visit.endBeforeStart.message')
        );
        return;
      }

      end = parsedEnd;
    }

    const startAt = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
    const endAt = end
      ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
      : undefined;

    registerVisit.mutate(
      {
        parentId,
        allDay,
        startAt: startAt.toISOString(),
        endAt: endAt?.toISOString(),
        photoBase64: photoBase64 ?? undefined,
        mimeType: photoMimeType,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const assistidoLabel = activeParent?.name ?? t('visit.noAssistido');
  const canSubmit = Boolean(activeParent) && !registerVisit.isPending;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('visit.title')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">{t('visit.title')}</Text>
      <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{t('visit.description')}</Text>

      <View className="mt-6">
        <Text className="font-sans text-sm text-mindful-brown">{t('visit.assistido')}</Text>
        <View className="mt-2 rounded-xl bg-white px-4 py-3">
          <Text className="font-sans-semibold text-mindful-brown">{assistidoLabel}</Text>
          {!activeParent ? (
            <Text className="mt-1 font-sans text-xs text-mindful-brown/60">
              {t('visit.selectAssistidoHint')}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between rounded-xl bg-white px-4 py-3">
        <Text className="font-sans text-sm text-mindful-brown">{t('visit.allDay')}</Text>
        <Switch
          accessibilityLabel={t('visit.allDay')}
          value={allDay}
          onValueChange={setAllDay}
        />
      </View>

      <View className="mt-4">
        <DatePickerField
          accessibilityLabel={t('visit.start')}
          label={t('visit.start')}
          value={startDate}
          onChange={setStartDate}
        />
      </View>

      {!allDay ? (
        <View className="mt-4">
          <DatePickerField
            accessibilityLabel={t('visit.end')}
            label={t('visit.end')}
            minimumDate={parseLocalDateInput(startDate) ?? undefined}
            value={endDate}
            onChange={setEndDate}
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={photoPreview ? t('visit.changePhoto') : t('visit.addPhoto')}
        className="mt-4 items-center rounded-xl border border-serenity-green py-3"
        onPress={() => void handlePickPhoto()}
      >
        <Text className="font-sans-semibold text-serenity-green">
          {photoPreview ? t('visit.changePhoto') : t('visit.addPhoto')}
        </Text>
      </Pressable>

      {photoPreview ? (
        <Image
          accessibilityLabel="Prévia da foto da visita"
          className="mt-4 h-40 w-full rounded-xl"
          resizeMode="cover"
          source={{ uri: photoPreview }}
        />
      ) : null}

      {registerVisit.isError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">{t('visit.registerError')}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('visit.register')}
        className={`mt-4 items-center rounded-xl py-3 ${canSubmit ? 'bg-serenity-green' : 'bg-mindful-brown/30'}`}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        {registerVisit.isPending ? (
          <ActivityIndicator color={colors.textLight} />
        ) : (
          <Text className="font-sans-semibold text-light">{t('visit.register')}</Text>
        )}
      </Pressable>
    </BottomSheet>
  );
}
