'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCreateFamily, useJoinFamily } from '@/core/services/usecases/family/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Divider } from '@/ui/Layout/Divider';
import { Stack } from '@/ui/Layout/Stack';

import { getFamilyErrorMessage } from '../family-api-error';

const MAX_NAME_LENGTH = 100;
const INVITE_CODE_LENGTH = 6;

export type FamilySetupVariant = 'onboarding' | 'additional';

type FamilySetupFormsProps = {
  variant: FamilySetupVariant;
  onSuccess: () => void;
};

export function FamilySetupForms({ variant, onSuccess }: FamilySetupFormsProps) {
  const t = useTranslations('family');
  const copyRoot = variant === 'onboarding' ? 'onboarding' : 'add';
  const createFamily = useCreateFamily();
  const joinFamily = useJoinFamily();

  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createValidationError, setCreateValidationError] = useState<string | null>(null);
  const [joinValidationError, setJoinValidationError] = useState<string | null>(null);

  function validateName(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed) return t('validation.nameRequired');
    if (trimmed.length > MAX_NAME_LENGTH) return t('validation.nameMaxLength');
    return null;
  }

  function validateCode(code: string): string | null {
    const trimmed = code.trim();
    if (!trimmed) return t('validation.codeRequired');
    if (trimmed.length !== INVITE_CODE_LENGTH) return t('validation.codeLength');
    return null;
  }

  function handleCreate() {
    const validationError = validateName(familyName);
    setCreateValidationError(validationError);
    if (validationError) return;

    createFamily.mutate({ name: familyName.trim() }, { onSuccess });
  }

  function handleJoin() {
    const validationError = validateCode(inviteCode);
    setJoinValidationError(validationError);
    if (validationError) return;

    joinFamily.mutate({ inviteCode }, { onSuccess });
  }

  return (
    <Stack gap="xl" align="stretch">
      <Stack gap="sm" align="stretch">
        <Title order={1}>{t(`${copyRoot}.title`)}</Title>
        <Text c="dimmed">{t(`${copyRoot}.subtitle`)}</Text>
      </Stack>

      <Stack gap="md" align="stretch">
        <Title order={3}>{t(`${copyRoot}.create.title`)}</Title>
        <Text size="sm" c="dimmed">
          {t(`${copyRoot}.create.description`)}
        </Text>
        <TextInput
          label={t(`${copyRoot}.create.nameLabel`)}
          placeholder={t(`${copyRoot}.create.namePlaceholder`)}
          value={familyName}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => {
            setFamilyName(event.currentTarget.value);
            setCreateValidationError(null);
          }}
        />
        {createValidationError && (
          <Alert color="red" variant="light">
            {createValidationError}
          </Alert>
        )}
        {createFamily.isError && (
          <Alert color="red" variant="light">
            {getFamilyErrorMessage(createFamily.error, t, 'create')}
          </Alert>
        )}
        <Button loading={createFamily.isPending} onClick={handleCreate}>
          {createFamily.isPending
            ? t(`${copyRoot}.create.loading`)
            : t(`${copyRoot}.create.submit`)}
        </Button>
      </Stack>

      <Divider label={t(`${copyRoot}.divider`)} labelPosition="center" />

      <Stack gap="md" align="stretch">
        <Title order={3}>{t(`${copyRoot}.join.title`)}</Title>
        <Text size="sm" c="dimmed">
          {t(`${copyRoot}.join.description`)}
        </Text>
        <TextInput
          label={t(`${copyRoot}.join.codeLabel`)}
          placeholder={t(`${copyRoot}.join.codePlaceholder`)}
          value={inviteCode}
          maxLength={INVITE_CODE_LENGTH}
          onChange={(event) => {
            setInviteCode(event.currentTarget.value.toUpperCase());
            setJoinValidationError(null);
          }}
        />
        {joinValidationError && (
          <Alert color="red" variant="light">
            {joinValidationError}
          </Alert>
        )}
        {joinFamily.isError && (
          <Alert color="red" variant="light">
            {getFamilyErrorMessage(joinFamily.error, t, 'join')}
          </Alert>
        )}
        <Button variant="light" loading={joinFamily.isPending} onClick={handleJoin}>
          {joinFamily.isPending ? t(`${copyRoot}.join.loading`) : t(`${copyRoot}.join.submit`)}
        </Button>
      </Stack>
    </Stack>
  );
}
