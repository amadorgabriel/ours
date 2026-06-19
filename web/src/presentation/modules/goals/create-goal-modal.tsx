'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCreateGoal } from '@/core/services/usecases/goal/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Modal } from '@/ui/Feedback/Modal';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Stack } from '@/ui/Layout/Stack';

import { getGoalErrorMessage } from './goals-api-error';

type CreateGoalModalProps = {
  opened: boolean;
  onClose: () => void;
};

const MAX_TITLE_LENGTH = 100;
const MIN_TARGET_AMOUNT = 10;

export function CreateGoalModal({ opened, onClose }: CreateGoalModalProps) {
  const t = useTranslations('goals');
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  function handleClose() {
    setTitle('');
    setTargetAmount('');
    createGoal.reset();
    onClose();
  }

  function handleSubmit() {
    const parsedAmount = Number(targetAmount.replace(',', '.'));

    createGoal.mutate(
      {
        title: title.trim(),
        targetAmount: parsedAmount,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const parsedAmount = Number(targetAmount.replace(',', '.'));
  const isValid =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TITLE_LENGTH &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount >= MIN_TARGET_AMOUNT;

  return (
    <Modal opened={opened} onClose={handleClose} title={t('create.title')}>
      <Stack gap="md" align="stretch">
        <Text size="sm" c="dimmed">
          {t('create.description')}
        </Text>

        <TextInput
          label={t('create.titleLabel')}
          placeholder={t('create.titlePlaceholder')}
          maxLength={MAX_TITLE_LENGTH}
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
        />

        <TextInput
          label={t('create.targetLabel')}
          placeholder={t('create.targetPlaceholder')}
          value={targetAmount}
          onChange={(event) => setTargetAmount(event.currentTarget.value)}
        />
        <Text size="xs" c="dimmed">
          {t('create.targetHint', { min: MIN_TARGET_AMOUNT.toFixed(2) })}
        </Text>

        {createGoal.isError && (
          <Alert color="red" variant="light">
            {getGoalErrorMessage(createGoal.error, t)}
          </Alert>
        )}

        <Button loading={createGoal.isPending} disabled={!isValid} onClick={handleSubmit}>
          {t('create.submit')}
        </Button>
      </Stack>
    </Modal>
  );
}
