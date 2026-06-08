'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCreateFamily, useJoinFamily } from '@/core/services/usecases/family/index.hooks';
import { useRouter } from '@/i18n/navigation';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Container } from '@/ui/Layout/Container';
import { Divider } from '@/ui/Layout/Divider';
import { Stack } from '@/ui/Layout/Stack';

import { getFamilyErrorMessage } from '../family-api-error';

const MAX_NAME_LENGTH = 100;
const INVITE_CODE_LENGTH = 6;

export function OnboardingPage() {
  const t = useTranslations('family');
  const router = useRouter();
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

    createFamily.mutate(
      { name: familyName.trim() },
      {
        onSuccess: () => router.replace('/dashboard'),
      }
    );
  }

  function handleJoin() {
    const validationError = validateCode(inviteCode);
    setJoinValidationError(validationError);
    if (validationError) return;

    joinFamily.mutate(
      { inviteCode },
      {
        onSuccess: () => router.replace('/dashboard'),
      }
    );
  }

  return (
    <Container className="py-10" size="sm">
      <Stack gap="xl" align="stretch">
        <Stack gap="sm" align="stretch">
          <Title order={1}>{t('onboarding.title')}</Title>
          <Text c="dimmed">{t('onboarding.subtitle')}</Text>
        </Stack>

        <Stack gap="md" align="stretch">
          <Title order={3}>{t('onboarding.create.title')}</Title>
          <Text size="sm" c="dimmed">
            {t('onboarding.create.description')}
          </Text>
          <TextInput
            label={t('onboarding.create.nameLabel')}
            placeholder={t('onboarding.create.namePlaceholder')}
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
            {createFamily.isPending ? t('onboarding.create.loading') : t('onboarding.create.submit')}
          </Button>
        </Stack>

        <Divider label={t('onboarding.divider')} labelPosition="center" />

        <Stack gap="md" align="stretch">
          <Title order={3}>{t('onboarding.join.title')}</Title>
          <Text size="sm" c="dimmed">
            {t('onboarding.join.description')}
          </Text>
          <TextInput
            label={t('onboarding.join.codeLabel')}
            placeholder={t('onboarding.join.codePlaceholder')}
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
            {joinFamily.isPending ? t('onboarding.join.loading') : t('onboarding.join.submit')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
