import { Text } from '@expo/ui';
import { useEffect, useState } from 'react';

import type { ParentId } from '@/core/domain/parent';
import { useRegisterCall } from '@/core/services/usecases/activity/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { AssistidoField } from '@/presentation/modules/feed/assistido-field';
import { ActivityFormSheet } from '@/presentation/modules/feed/activity-form-sheet';
import { FormActionRow, NotesField } from '@/presentation/modules/feed/form-controls';
import { useAssistido } from '@/presentation/providers/assistido';
import { type } from '@/presentation/styles/tokens';
import { resolveInitialFormParentId } from '@/ui/Forms/AssistidoPickerField';

type CallNowSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CallNowSheet({ visible, onClose }: CallNowSheetProps) {
  const { t } = useTranslation();
  const { parentId, parents } = useAssistido();
  const registerCall = useRegisterCall();
  const [notes, setNotes] = useState('');
  const [formParentId, setFormParentId] = useState<ParentId | null>(null);

  useEffect(() => {
    if (visible) {
      setFormParentId(resolveInitialFormParentId(parentId, parents));
    }
  }, [visible, parentId, parents]);

  function handleClose() {
    setNotes('');
    registerCall.reset();
    onClose();
  }

  function handleSubmit() {
    if (!formParentId) {
      return;
    }

    const trimmed = notes.trim();
    registerCall.mutate(
      {
        parentId: formParentId,
        notes: trimmed || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const canSubmit = Boolean(formParentId) && !registerCall.isPending;

  return (
    <ActivityFormSheet
      description={t('call.description')}
      testID="call-sheet"
      title={t('call.title')}
      visible={visible}
      onClose={handleClose}
    >
      <AssistidoField
        label={t('common.assistido')}
        parents={parents}
        value={formParentId}
        onChange={setFormParentId}
      />

      <NotesField
        label={t('call.notes')}
        placeholder={t('call.notesPlaceholder')}
        testID="call-notes"
        value={notes}
        onChangeText={setNotes}
      />

      {registerCall.isError ? (
        <Text textStyle={type.danger}>{t('errors.activity.registerCallFailed')}</Text>
      ) : null}

      <FormActionRow
        primaryDisabled={!canSubmit}
        primaryLabel={t('common.register')}
        primaryPending={registerCall.isPending}
        primaryTestID="register-call"
        onPrimary={handleSubmit}
      />
    </ActivityFormSheet>
  );
}
