import { Text } from '@expo/ui';
import { useEffect, useState } from 'react';
import { Image, Pressable } from 'react-native';

import type { ParentId } from '@/core/domain/parent';
import { HttpClientError } from '@/core/infra/http/http-error';
import { useRegisterVisit } from '@/core/services/usecases/activity/index.hooks';
import {
  formatLocalDateInput,
  parseLocalDateInput,
} from '@/core/services/usecases/activity/month-range';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { ActivityFormSheet } from '@/presentation/modules/feed/activity-form-sheet';
import { AssistidoField } from '@/presentation/modules/feed/assistido-field';
import { AllDayField, FormActionRow, FormHost } from '@/presentation/modules/feed/form-controls';
import { visitPhotoPreviewStyle } from '@/presentation/modules/feed/form-metrics';
import { useVisitPhotoPicker } from '@/presentation/modules/feed/use-visit-photo';
import { buildVisitSchedule } from '@/presentation/modules/feed/visit-schedule';
import { useAppAlert } from '@/presentation/providers/alert';
import { useAssistido } from '@/presentation/providers/assistido';
import { type } from '@/presentation/styles/tokens';
import { DatePickerField } from '@/ui/Forms/DatePickerField';
import { resolveInitialFormParentId } from '@/ui/Forms/AssistidoPickerField';

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
  const { choosePhoto } = useVisitPhotoPicker();
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

  function handleSubmit() {
    if (!formParentId) {
      return;
    }

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

    registerVisit.mutate(
      {
        parentId: formParentId,
        allDay,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
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
  const errorDetail = registerVisit.isError ? formatRegisterVisitError(registerVisit.error) : null;

  return (
    <>
    <ActivityFormSheet
      description={t('visit.description')}
      testID="visit-sheet"
      title={t('visit.title')}
      visible={visible}
      onClose={handleClose}
    >
      <AssistidoField
        label={t('visit.assistido')}
        parents={parents}
        value={formParentId}
        onChange={setFormParentId}
      />

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
          <Pressable accessibilityRole="button">
            <Image
              accessibilityLabel={t('visit.photoPreviewAccessibility')}
              source={{ uri: photoPreview }}
              style={visitPhotoPreviewStyle}
            />
          </Pressable>
        </FormHost>
      ) : null}

      {registerVisit.isError ? (
        <Text textStyle={type.danger}>{t('visit.registerError')}</Text>
      ) : null}
      {errorDetail ? <Text textStyle={type.dangerCaption}>{errorDetail}</Text> : null}

      <FormActionRow
        primaryDisabled={!canSubmit}
        primaryLabel={t('visit.register')}
        primaryPending={registerVisit.isPending}
        primaryTestID="register-visit"
        secondaryLabel={photoPreview ? t('visit.changePhoto') : t('visit.addPhoto')}
        secondaryTestID="visit-photo"
        onPrimary={handleSubmit}
        onSecondary={() =>
          choosePhoto((photo) => {
            setPhotoPreview(photo.base64);
            setPhotoBase64(photo.base64);
            setPhotoMimeType(photo.mimeType);
          })
        }
      />
    </ActivityFormSheet>
    </>
  );
}
