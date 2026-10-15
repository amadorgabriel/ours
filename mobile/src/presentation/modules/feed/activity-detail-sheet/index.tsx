import { Text } from '@expo/ui';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text as NativeText, View } from 'react-native';

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
import { relationshipLabel } from '@/presentation/modules/family/relationship-label';
import { ActivityFormSheet } from '@/presentation/modules/feed/activity-form-sheet';
import { AllDayField, FormActionRow, FormHost, FormTextAction, NotesField } from '@/presentation/modules/feed/form-controls';
import { visitPhotoPreviewStyle } from '@/presentation/modules/feed/form-metrics';
import { useVisitPhotoPicker } from '@/presentation/modules/feed/use-visit-photo';
import { buildVisitSchedule } from '@/presentation/modules/feed/visit-schedule';
import { useAppAlert } from '@/presentation/providers/alert';
import { useOptionalAssistido } from '@/presentation/providers/assistido';
import { type } from '@/presentation/styles/tokens';
import { PersonAvatar } from '@/ui/DataDisplay/PersonAvatar';
import { DatePickerField } from '@/ui/Forms/DatePickerField';
import { ImagePreview } from '@/ui/Feedback/ImagePreview';

type ActivityDetailSheetProps = {
  visible: boolean;
  item: ActivityFeedItem | null;
  onClose: () => void;
};

function toIsoDateInput(date: Date): string {
  return formatLocalDateInput(date);
}

export function ActivityDetailSheet({ visible, item, onClose }: ActivityDetailSheetProps) {
  const { t } = useTranslation();
  const { alert } = useAppAlert();
  const assistido = useOptionalAssistido();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const { choosePhoto } = useVisitPhotoPicker();
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [allDay, setAllDay] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string | undefined>();
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fullscreenPhotoVisible, setFullscreenPhotoVisible] = useState(false);
  const [baseline, setBaseline] = useState({
    notes: '',
    allDay: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!item || !visible) {
      return;
    }

    const nextNotes = item.notes ?? '';
    const nextAllDay = item.allDay ?? true;
    const nextStart = item.startAt ? toIsoDateInput(new Date(item.startAt)) : toIsoDateInput(new Date());
    const nextEnd = item.endAt ? toIsoDateInput(new Date(item.endAt)) : toIsoDateInput(new Date());

    setMode('view');
    setNotes(nextNotes);
    setAllDay(nextAllDay);
    setStartDate(nextStart);
    setEndDate(nextEnd);
    setBaseline({ notes: nextNotes, allDay: nextAllDay, startDate: nextStart, endDate: nextEnd });
    setPhotoPreview(item.photoUrl ?? null);
    setPhotoBase64(null);
    setPhotoMimeType(undefined);
    setRemovePhoto(false);
    setFullscreenPhotoVisible(false);
    updateActivity.reset();
    deleteActivity.reset();
    // Reset only when the opened activity changes. Mutation objects are unstable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, visible]);

  function handleClose() {
    setMode('view');
    setFullscreenPhotoVisible(false);
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

  function handleRemovePhoto() {
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoMimeType(undefined);
    setRemovePhoto(true);
  }

  function handleSaveCall() {
    if (!item) return;

    const trimmed = notes.trim();
    updateActivity.mutate(
      {
        activityId: item.id,
        data: { notes: trimmed || undefined },
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

    const schedule = buildVisitSchedule({ allDay, startDate, endDate });
    if (!schedule.ok) {
      if (schedule.error === 'invalidStart') {
        alert(t('alerts.visit.invalidStartDate.title'), t('alerts.visit.invalidStartDate.message'));
      } else if (schedule.error === 'invalidEnd') {
        alert(t('alerts.visit.invalidEndDate.title'), t('alerts.visit.invalidEndDate.message'));
      } else {
        alert(t('alerts.visit.endBeforeStart.title'), t('alerts.visit.endBeforeStart.message'));
      }
      return;
    }

    updateActivity.mutate(
      {
        activityId: item.id,
        data: {
          allDay,
          startAt: schedule.startAt,
          endAt: schedule.endAt,
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
  const photoUri = mode === 'view' ? (item.photoUrl ?? '') : (photoPreview ?? '');
  const parent = item.parentId
    ? assistido?.parents.find((candidate) => candidate.id === item.parentId)
    : undefined;
  const assistidoName = item.parentName ?? parent?.name;
  const callDirty = notes.trim() !== baseline.notes.trim();
  const visitDirty =
    allDay !== baseline.allDay ||
    startDate !== baseline.startDate ||
    endDate !== baseline.endDate ||
    Boolean(photoBase64) ||
    removePhoto;

  return (
    <>
      <ActivityFormSheet
        testID="activity-detail-sheet"
        title={mode === 'edit' ? t('activityDetail.editTitle') : t('activityDetail.title')}
        visible={visible}
        onClose={handleClose}
      >
        {mode === 'view' ? (
          <>
            <FormHost>
              <View className="rounded-2xl bg-white px-4 py-3">
                {assistidoName ? (
                  <View className="flex-row items-center">
                    <PersonAvatar name={assistidoName} photoUri={parent?.photoData} />
                    <View className="ml-3 min-w-0 flex-1">
                      <NativeText className="font-sans text-xs text-mindful-brown/60">
                        {t('common.assistido')}
                      </NativeText>
                      <NativeText className="font-sans-semibold text-base text-mindful-brown" numberOfLines={1}>
                        {assistidoName}
                      </NativeText>
                      {parent?.relationship ? (
                        <NativeText className="font-sans text-sm text-mindful-brown/70" numberOfLines={1}>
                          {relationshipLabel(parent.relationship)}
                        </NativeText>
                      ) : null}
                    </View>
                  </View>
                ) : null}
                <NativeText className={`font-sans text-sm text-mindful-brown ${assistidoName ? 'mt-3' : ''}`}>
                  {item.userName}
                </NativeText>
                {item.notes ? (
                  <NativeText className="mt-2 font-sans text-sm text-mindful-brown/80">{item.notes}</NativeText>
                ) : null}
              </View>
            </FormHost>
            {item.type === 'Visit' && item.photoUrl && !removePhoto ? (
              <FormHost>
                <Pressable
                  accessibilityLabel={t('activityCard.visitPhotoPreviewAccessibility')}
                  accessibilityRole="button"
                  onPress={() => setFullscreenPhotoVisible(true)}
                >
                  <Image
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    source={{ uri: item.photoUrl }}
                    style={visitPhotoPreviewStyle}
                  />
                </Pressable>
              </FormHost>
            ) : null}

            <FormActionRow
              primaryDisabled={isPending}
              primaryLabel={t('common.edit')}
              primaryTestID="activity-edit"
              secondaryDisabled={isPending}
              secondaryLabel={t('common.delete')}
              secondaryTestID="activity-delete"
              secondaryTone="danger"
              onPrimary={() => setMode('edit')}
              onSecondary={handleDelete}
            />
          </>
        ) : null}

        {mode === 'edit' && item.type === 'Call' ? (
          <>
            <NotesField
              label={t('call.notes')}
              placeholder={t('call.notesPlaceholder')}
              testID="call-notes"
              value={notes}
              onChangeText={setNotes}
            />
            <FormActionRow
              primaryDisabled={isPending || !callDirty}
              primaryLabel={t('common.save')}
              primaryPending={isPending}
              primaryTestID="activity-save"
              onPrimary={handleSaveCall}
            />
          </>
        ) : null}

        {mode === 'edit' && item.type === 'Visit' ? (
          <>
            <AllDayField label={t('visit.allDay')} value={allDay} onValueChange={setAllDay} />

            <FormHost>
              <DatePickerField
                allowClear
                accessibilityLabel={t('visit.start')}
                label={t('visit.start')}
                value={startDate}
                onChange={setStartDate}
              />
            </FormHost>

            {!allDay ? (
              <FormHost>
                <DatePickerField
                  allowClear
                  accessibilityLabel={t('visit.end')}
                  label={t('visit.end')}
                  minimumDate={parseLocalDateInput(startDate) ?? undefined}
                  value={endDate}
                  onChange={setEndDate}
                />
              </FormHost>
            ) : null}

            {photoPreview ? (
              <FormHost>
                <Pressable
                  accessibilityLabel={t('activityCard.visitPhotoPreviewAccessibility')}
                  accessibilityRole="button"
                  onPress={() => setFullscreenPhotoVisible(true)}
                >
                  <Image
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    source={{ uri: photoPreview }}
                    style={visitPhotoPreviewStyle}
                  />
                </Pressable>
              </FormHost>
            ) : null}

            {photoPreview ? (
              <FormTextAction
                label={t('activityDetail.removePhoto')}
                testID="remove-visit-photo"
                onPress={handleRemovePhoto}
              />
            ) : null}

            <FormActionRow
              primaryDisabled={isPending || !visitDirty}
              primaryLabel={t('common.save')}
              primaryPending={isPending}
              primaryTestID="activity-save"
              secondaryLabel={photoPreview ? t('visit.changePhoto') : t('visit.addPhoto')}
              secondaryTestID="visit-photo"
              onPrimary={handleSaveVisit}
              onSecondary={() =>
                choosePhoto((photo) => {
                  setPhotoPreview(photo.base64);
                  setPhotoBase64(photo.base64);
                  setPhotoMimeType(photo.mimeType);
                  setRemovePhoto(false);
                })
              }
            />
          </>
        ) : null}

        {hasMutationError ? (
          <Text textStyle={type.danger}>{t('activityDetail.saveError')}</Text>
        ) : null}
      </ActivityFormSheet>
      <ImagePreview
        uri={photoUri}
        visible={fullscreenPhotoVisible}
        onClose={() => setFullscreenPhotoVisible(false)}
      />
    </>
  );
}
