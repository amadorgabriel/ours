'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCreateGoalContribution } from '@/core/services/usecases/goal/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Modal } from '@/ui/Feedback/Modal';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Stack } from '@/ui/Layout/Stack';

import { getContributionErrorMessage } from './goals-api-error';

type ContributeModalProps = {
  opened: boolean;
  goalId: string;
  onClose: () => void;
};

const MIN_AMOUNT = 1;

export function ContributeModal({ opened, goalId, onClose }: ContributeModalProps) {
  const t = useTranslations('goals');
  const createContribution = useCreateGoalContribution(goalId);
  const [amount, setAmount] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  function handleClose() {
    setAmount('');
    setIsPrivate(false);
    createContribution.reset();
    onClose();
  }

  function handleSubmit() {
    const parsedAmount = Number(amount.replace(',', '.'));

    createContribution.mutate(
      {
        amount: parsedAmount,
        isPrivate,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  }

  const parsedAmount = Number(amount.replace(',', '.'));
  const isValid = !Number.isNaN(parsedAmount) && parsedAmount >= MIN_AMOUNT;

  return (
    <Modal opened={opened} onClose={handleClose} title={t('contribute.title')}>
      <Stack gap="md" align="stretch">
        <Text size="sm" c="dimmed">
          {t('contribute.description')}
        </Text>

        <TextInput
          label={t('contribute.amountLabel')}
          placeholder={t('contribute.amountPlaceholder')}
          value={amount}
          onChange={(event) => setAmount(event.currentTarget.value)}
        />
        <Text size="xs" c="dimmed">
          {t('contribute.amountHint', { min: MIN_AMOUNT.toFixed(2) })}
        </Text>

        <Stack gap="xs" align="stretch">
          <Text size="sm">{t('contribute.privateLabel')}</Text>
          <Text size="xs" c="dimmed">
            {t('contribute.privateHint')}
          </Text>
          <Button
            variant={isPrivate ? 'filled' : 'light'}
            size="compact-sm"
            className="w-fit"
            onClick={() => setIsPrivate((value) => !value)}
          >
            {isPrivate ? t('contribute.privateOn') : t('contribute.privateOff')}
          </Button>
        </Stack>

        {createContribution.isError && (
          <Alert color="red" variant="light">
            {getContributionErrorMessage(createContribution.error, t)}
          </Alert>
        )}

        <Button loading={createContribution.isPending} disabled={!isValid} onClick={handleSubmit}>
          {t('contribute.submit')}
        </Button>
      </Stack>
    </Modal>
  );
}
