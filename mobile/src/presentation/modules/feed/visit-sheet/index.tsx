import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';

import type { ParentId } from '@/core/domain/parent';
import { HttpClientError } from '@/core/infra/http/http-error';
import { useRegisterVisit } from '@/core/services/usecases/activity/index.hooks';
import {
  formatLocalDateInput,
  parseLocalDateInput,
} from '@/core/services/usecases/activity/month-range';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { pickCompressedVisitPhoto, type VisitPhotoSource } from '@/presentation/modules/feed/pick-visit-photo';
import { useAppAlert } from '@/presentation/providers/alert';
import { useAssistido } from '@/presentation/providers/assistido';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { DatePickerField } from '@/ui/Forms/DatePickerField';
import {
  AssistidoPickerField,
  resolveInitialFormParentId,
} from '@/ui/Forms/AssistidoPickerField';

type VisitSheetProps = {
  visible: boolean;
  onClose: () => void;
};

function toIsoDateInput(date: Date): string {
  return formatLocalDateInput(date);
}

function formatRegisterVisitError(error: unknown): string | null {
  if (!(error instanceof HttpClientError)) {
    return null;
  }

  const payload = error.data as { message?: string } | undefined;
  const parts: string[] = [];
  if (error.statusCode) {
    parts.push(`HTTP ${error.statusCode}`);
  }
  if (payload?.message) {
    parts.push(payload.message);
  }

  return parts.length > 0 ? parts.join(': ') : null;
}

export function VisitSheet({ visible, onClose }: VisitSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const { parentId, parents } = useAssistido();
  const registerVisit = useRegisterVisit();
  const [formParentId, setFormParentId] = useState<ParentId | null>(null);
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState(toIsoDateInput(new Date()));
  const [endDate, setEndDate] = useState(toIsoDateInput(new Date()));
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setFormParentId(resolveInitialFormParentId(parentId, parents));
    }
  }, [visible, parentId, parents]);

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

  function handlePickPhoto() {
    alert(t('visit.photoSourceTitle'), t('visit.photoSourceMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('visit.photoGallery'), onPress: () => void capturePhoto('library') },
      { text: t('visit.photoCamera'), onPress: () => void capturePhoto('camera') },
    ]);
  }

  async function capturePhoto(source: VisitPhotoSource) {
    try {
      const photo = await pickCompressedVisitPhoto(source, () => {
        alert(
          t('alerts.galleryPermission.title'),
          source === 'camera'
            ? t('alerts.cameraPermission.visitMessage')
            : t('alerts.galleryPermission.visitMessage')
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
    if (!formParentId) {
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
        parentId: formParentId,
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

  const canSubmit = Boolean(formParentId) && !registerVisit.isPending;

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
        <AssistidoPickerField
          inline
          label={t('visit.assistido')}
          parents={parents}
          requiredHint={t('assistidoPicker.requiredHint')}
          value={formParentId}
          onChange={setFormParentId}
        />
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
          accessibilityLabel={t('visit.photoPreviewAccessibility')}
          className="mt-4 h-40 w-full rounded-xl"
          resizeMode="cover"
          source={{ uri: photoPreview }}
        />
      ) : null}

      {registerVisit.isError ? (
        <View className="mt-2">
          <Text className="font-sans text-sm text-red-600">{t('visit.registerError')}</Text>
          {(() => {
            const detail = formatRegisterVisitError(registerVisit.error);
            return detail ? (
              <Text className="mt-1 font-sans text-xs text-red-600/90">{detail}</Text>
            ) : null;
          })()}
        </View>
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
