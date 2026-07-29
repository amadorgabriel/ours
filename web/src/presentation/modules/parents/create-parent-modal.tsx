'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  PARENT_RELATIONSHIPS,
  type ParentRelationship,
} from '@/core/domain/parent';
import { useCreateParent } from '@/core/services/usecases/parent/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Modal } from '@/ui/Feedback/Modal';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Stack } from '@/ui/Layout/Stack';

import { getParentErrorMessage } from './parents-api-error';

type CreateParentModalProps = {
  opened: boolean;
  onClose: () => void;
};

const MAX_NAME_LENGTH = 100;

export function CreateParentModal({ opened, onClose }: CreateParentModalProps) {
  const t = useTranslations('parents');
  const createParent = useCreateParent();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<ParentRelationship>('Pai');
  const [birthDate, setBirthDate] = useState('');

  function handleClose() {
    setName('');
    setRelationship('Pai');
    setBirthDate('');
    createParent.reset();
    onClose();
  }

  function handleSubmit() {
    createParent.mutate(
      {
        name: name.trim(),
        relationship,
        birthDate: birthDate.trim() || undefined,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const isValid = name.trim().length > 0 && name.trim().length <= MAX_NAME_LENGTH;

  return (
    <Modal opened={opened} onClose={handleClose} title={t('create.title')}>
      <Stack gap="md" align="stretch">
        <Text size="sm" c="dimmed">
          {t('create.description')}
        </Text>

        <TextInput
          label={t('create.nameLabel')}
          placeholder={t('create.namePlaceholder')}
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
        />

        <Stack gap="xs" align="stretch">
          <Text size="sm">{t('create.relationshipLabel')}</Text>
          <Stack gap="xs" align="stretch" className="sm:flex-row sm:flex-wrap">
            {PARENT_RELATIONSHIPS.map((option) => (
              <Button
                key={option}
                variant={relationship === option ? 'filled' : 'light'}
                size="compact-sm"
                onClick={() => setRelationship(option)}
              >
                {option}
              </Button>
            ))}
          </Stack>
        </Stack>

        <TextInput
          label={t('create.birthDateLabel')}
          placeholder={t('create.birthDatePlaceholder')}
          value={birthDate}
          onChange={(event) => setBirthDate(event.currentTarget.value)}
        />

        {createParent.isError && (
          <Alert color="red" variant="light">
            {getParentErrorMessage(createParent.error, t, 'create')}
          </Alert>
        )}

        <Button loading={createParent.isPending} disabled={!isValid} onClick={handleSubmit}>
          {t('create.submit')}
        </Button>
      </Stack>
    </Modal>
  );
}
