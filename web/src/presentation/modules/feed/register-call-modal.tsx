'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { ParentSummary } from '@/core/domain/parent';
import { useParents } from '@/core/services/usecases/parent/index.hooks';
import { useRegisterCall } from '@/core/services/usecases/activity/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Modal } from '@/ui/Feedback/Modal';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Stack } from '@/ui/Layout/Stack';

type RegisterCallModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function RegisterCallModal({ opened, onClose }: RegisterCallModalProps) {
  const t = useTranslations('feed');
  const registerCall = useRegisterCall();
  const { data: parents } = useParents(opened);
  const [parentId, setParentId] = useState<string | undefined>();
  const [notes, setNotes] = useState('');

  function handleClose() {
    setParentId(undefined);
    setNotes('');
    registerCall.reset();
    onClose();
  }

  function handleSubmit() {
    registerCall.mutate(
      {
        parentId,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const items = parents ?? [];

  return (
    <Modal opened={opened} onClose={handleClose} title={t('registerCall.title')}>
      <Stack gap="md" align="stretch">
        <Text size="sm" c="dimmed">
          {t('registerCall.description')}
        </Text>

        {items.length > 0 && (
          <Stack gap="xs" align="stretch">
            <Text size="sm">{t('registerCall.parentLabel')}</Text>
            <Stack gap="xs" align="stretch" className="sm:flex-row sm:flex-wrap">
              <Button
                variant={parentId === undefined ? 'filled' : 'light'}
                size="compact-sm"
                onClick={() => setParentId(undefined)}
              >
                {t('registerCall.noParent')}
              </Button>
              {items.map((parent: ParentSummary) => (
                <Button
                  key={parent.id}
                  variant={parentId === parent.id ? 'filled' : 'light'}
                  size="compact-sm"
                  onClick={() => setParentId(parent.id)}
                >
                  {parent.name}
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <TextInput
          label={t('registerCall.notesLabel')}
          placeholder={t('registerCall.notesPlaceholder')}
          value={notes}
          onChange={(event) => setNotes(event.currentTarget.value)}
        />

        {registerCall.isError && (
          <Alert color="red" variant="light">
            {t('registerCall.error')}
          </Alert>
        )}

        <Button loading={registerCall.isPending} onClick={handleSubmit}>
          {t('registerCall.submit')}
        </Button>
      </Stack>
    </Modal>
  );
}
