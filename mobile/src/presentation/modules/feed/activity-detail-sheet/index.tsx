import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';

import type { ActivityFeedItem } from '@/core/domain/activity';
import {
  useDeleteActivity,
  useUpdateActivity,
} from '@/core/services/usecases/activity/index.hooks';
import {
  formatLocalDateInput,
  parseLocalDateInput,
} from '@/core/services/usecases/activity/month-range';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { useAppAlert } from '@/presentation/providers/alert';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { DatePickerField } from '@/ui/Forms/DatePickerField';
import { SheetTextInput } from '@/ui/Forms/SheetTextInput';

type ActivityDetailSheetProps = {
  visible: boolean;
  item: ActivityFeedItem | null;
  onClose: () => void;
};

const MAX_NOTES_LENGTH = 500;

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

function toIsoDateInput(date: Date): string {
  return formatLocalDateInput(date);
}

export function ActivityDetailSheet({ visible, item, onClose }: ActivityDetailSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [notes, setNotes] = useState('');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | undefined>();
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => {
    if (!item || !visible) {
      return;
    }

    setMode('view');
    setNotes(item.notes ?? '');
    setAllDay(item.allDay ?? true);
    setStartDate(item.startAt ? toIsoDateInput(new Date(item.startAt)) : toIsoDateInput(new Date()));
    setEndDate(item.endAt ? toIsoDateInput(new Date(item.endAt)) : toIsoDateInput(new Date()));
    setPhotoPreview(item.photoUrl ?? null);
    setPhotoBase64(null);
    setPhotoMimeType(undefined);
    setRemovePhoto(false);
    updateActivity.reset();
    deleteActivity.reset();
  }, [item, visible]);

  function handleClose() {
    setMode('view');
    onClose();
  }

  function handleDelete() {
    if (!item) return;

    alert(t('activityDetail.deleteTitle'), t('activityDetail.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteActivity.mutate(item.id, {
            onSuccess: () => {
              handleClose();
            },
          });
        },
      },
    ]);
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
      setRemovePhoto(false);
    } catch {
      alert(t('alerts.photoError.title'), t('alerts.photoError.processMessage'));
    }
  }

  function handleRemovePhoto() {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoMimeType(undefined);
    setRemovePhoto(true);
  }

  function handleSaveCall() {
    if (!item) return;

    updateActivity.mutate(
      {
        activityId: item.id,
        data: { notes: notes.trim() || undefined },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  function handleSaveVisit() {
    if (!item) return;

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

    updateActivity.mutate(
      {
        activityId: item.id,
        data: {
          allDay,
          startAt: startAt.toISOString(),
          endAt: endAt?.toISOString(),
          photoBase64: photoBase64 ?? undefined,
          mimeType: photoMimeType,
          removePhoto,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  if (!item) {
    return null;
  }

  const isPending = updateActivity.isPending || deleteActivity.isPending;
  const hasMutationError = updateActivity.isError || deleteActivity.isError;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      accessibilityLabel={t('activityDetail.sheetAccessibility')}
      scrollable
    >
      <Text className="font-sans-semibold text-xl text-mindful-brown">
        {mode === 'edit' ? t('activityDetail.editTitle') : t('activityDetail.title')}
      </Text>

      {mode === 'view' ? (
        <>
          <Text className="mt-2 font-sans text-sm text-mindful-brown/80">{item.userName}</Text>
          {item.parentName ? (
            <Text className="mt-1 font-sans text-sm text-mindful-brown/70">
              {t('activityCard.assistido', { name: item.parentName })}
            </Text>
          ) : null}
          {item.notes ? (
            <Text className="mt-3 font-sans text-sm text-mindful-brown">{item.notes}</Text>
          ) : null}
          {item.type === 'Visit' && item.photoUrl && !removePhoto ? (
            <Image
              accessibilityLabel={t('activityCard.visitPhotoAccessibility')}
              className="mt-3 h-40 w-full rounded-xl"
              resizeMode="cover"
              source={{ uri: item.photoUrl }}
            />
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('activityDetail.editAccessibility')}
            className="mt-6 items-center rounded-xl border border-serenity-green py-3"
            disabled={isPending}
            onPress={() => setMode('edit')}
          >
            <Text className="font-sans-semibold text-serenity-green">{t('common.edit')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('activityDetail.deleteAccessibility')}
            className="mt-3 items-center rounded-xl border border-red-500 py-3"
            disabled={isPending}
            onPress={handleDelete}
          >
            {deleteActivity.isPending ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text className="font-sans-semibold text-red-600">{t('common.delete')}</Text>
            )}
          </Pressable>
        </>
      ) : null}

      {mode === 'edit' && item.type === 'Call' ? (
        <>
          <View className="mt-4">
            <Text className="font-sans text-sm text-mindful-brown">{t('call.notes')}</Text>
            <SheetTextInput
              accessibilityLabel={t('call.notesAccessibility')}
              className="mt-2 min-h-[96px] rounded-xl bg-white px-4 py-3 font-sans text-mindful-brown"
              maxLength={MAX_NOTES_LENGTH}
              multiline
              placeholder={t('call.notesPlaceholder')}
              placeholderTextColor={colors.mindfulBrown60}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('activityDetail.saveAccessibility')}
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            disabled={isPending}
            onPress={handleSaveCall}
          >
            {updateActivity.isPending ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">{t('common.save')}</Text>
            )}
          </Pressable>
        </>
      ) : null}

      {mode === 'edit' && item.type === 'Visit' ? (
        <>
          <View className="mt-4 flex-row items-center justify-between rounded-xl bg-white px-4 py-3">
            <Text className="font-sans text-sm text-mindful-brown">{t('visit.allDay')}</Text>
            <Switch accessibilityLabel={t('visit.allDay')} value={allDay} onValueChange={setAllDay} />
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
            <>
              <Image
                accessibilityLabel={t('visit.photoPreviewAccessibility')}
                className="mt-4 h-40 w-full rounded-xl"
                resizeMode="cover"
                source={{ uri: photoPreview }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('activityDetail.removePhotoAccessibility')}
                className="mt-3 items-center rounded-xl border border-red-500 py-3"
                onPress={handleRemovePhoto}
              >
                <Text className="font-sans-semibold text-red-600">
                  {t('activityDetail.removePhoto')}
                </Text>
              </Pressable>
            </>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('activityDetail.saveAccessibility')}
            className="mt-4 items-center rounded-xl bg-serenity-green py-3"
            disabled={isPending}
            onPress={handleSaveVisit}
          >
            {updateActivity.isPending ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text className="font-sans-semibold text-light">{t('common.save')}</Text>
            )}
          </Pressable>
        </>
      ) : null}

      {hasMutationError ? (
        <Text className="mt-2 font-sans text-sm text-red-600">{t('activityDetail.saveError')}</Text>
      ) : null}
    </BottomSheet>
  );
}
