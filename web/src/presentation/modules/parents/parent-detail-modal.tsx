'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { ParentId } from '@/core/domain/parent';
import { useParent, useUpdateParent } from '@/core/services/usecases/parent/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Modal } from '@/ui/Feedback/Modal';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { TextInput } from '@/ui/DataEntry/TextInput';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { getParentErrorMessage } from './parents-api-error';

type ParentDetailModalProps = {
  parentId: ParentId | null;
  opened: boolean;
  isAdmin: boolean;
  onClose: () => void;
};

function ReadSection({
  title,
  content,
  emptyMessage,
}: {
  title: string;
  content?: string;
  emptyMessage: string;
}) {
  return (
    <Stack gap="xs" align="stretch">
      <Title order={5}>{title}</Title>
      {content ? (
        <SurfaceCard>
          <Text size="sm">{content}</Text>
        </SurfaceCard>
      ) : (
        <Text size="sm" c="dimmed">
          {emptyMessage}
        </Text>
      )}
    </Stack>
  );
}

export function ParentDetailModal({
  parentId,
  opened,
  isAdmin,
  onClose,
}: ParentDetailModalProps) {
  const t = useTranslations('parents');
  const { data: parent, isLoading, isError, refetch } = useParent(parentId, opened);
  const updateParent = useUpdateParent(parentId ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState('');
  const [emergencyBriefing, setEmergencyBriefing] = useState('');

  function handleClose() {
    updateParent.reset();
    setIsEditing(false);
    onClose();
  }

  function handleStartEdit() {
    if (!parent) return;

    setMedicalInfo(parent.medicalInfo ?? '');
    setEmergencyBriefing(parent.emergencyBriefing ?? '');
    setIsEditing(true);
  }

  function handleSaveMedical() {
    if (!parent) return;

    updateParent.mutate(
      {
        name: parent.name,
        relationship: parent.relationship,
        birthDate: parent.birthDate,
        medicalInfo: medicalInfo.trim() || undefined,
        emergencyBriefing: emergencyBriefing.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  }

  if (!parentId) {
    return null;
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={parent?.name ?? t('detail.title')}
      size="lg"
    >
      {isLoading ? (
        <Text c="dimmed">{t('loading')}</Text>
      ) : isError || !parent ? (
        <Stack gap="md" align="stretch">
          <Alert color="red" variant="light">
            {t('loadError')}
          </Alert>
          <Button variant="light" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        </Stack>
      ) : (
        <Stack gap="lg" align="stretch">
          <Stack gap={4} align="stretch">
            <Text size="sm" c="dimmed">
              {parent.relationship}
              {parent.birthDate ? ` · ${parent.birthDate}` : ''}
            </Text>
          </Stack>

          {isAdmin && isEditing ? (
            <Stack gap="md" align="stretch">
              <TextInput
                label={t('detail.medicalLabel')}
                value={medicalInfo}
                onChange={(event) => setMedicalInfo(event.currentTarget.value)}
              />
              <TextInput
                label={t('detail.emergencyLabel')}
                value={emergencyBriefing}
                onChange={(event) => setEmergencyBriefing(event.currentTarget.value)}
              />
              {updateParent.isError && (
                <Alert color="red" variant="light">
                  {getParentErrorMessage(updateParent.error, t, 'update')}
                </Alert>
              )}
              <Stack gap="sm" align="stretch" className="sm:flex-row">
                <Button loading={updateParent.isPending} onClick={handleSaveMedical}>
                  {t('detail.save')}
                </Button>
                <Button variant="light" onClick={() => setIsEditing(false)}>
                  {t('detail.cancel')}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <ReadSection
                title={t('detail.medicalLabel')}
                content={parent.medicalInfo}
                emptyMessage={t('detail.medicalEmpty')}
              />
              <ReadSection
                title={t('detail.emergencyLabel')}
                content={parent.emergencyBriefing}
                emptyMessage={t('detail.emergencyEmpty')}
              />
              {isAdmin && (
                <Button variant="light" onClick={handleStartEdit}>
                  {t('detail.edit')}
                </Button>
              )}
            </>
          )}
        </Stack>
      )}
    </Modal>
  );
}
