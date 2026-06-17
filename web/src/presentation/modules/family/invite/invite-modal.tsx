'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { CreateInviteResponse } from '@/core/domain/family';
import { useCreateInvite } from '@/core/services/usecases/family/index.hooks';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Modal } from '@/ui/Feedback/Modal';
import { Stack } from '@/ui/Layout/Stack';

import { getFamilyErrorMessage } from '../family-api-error';

type InviteModalProps = {
  opened: boolean;
  onClose: () => void;
};

function formatExpiresAt(expiresAt: string): string {
  return format(new Date(expiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function InviteModal({ opened, onClose }: InviteModalProps) {
  const t = useTranslations('family');
  const createInvite = useCreateInvite();
  const [invite, setInvite] = useState<CreateInviteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    setInvite(null);
    setCopied(false);
    createInvite.reset();
    onClose();
  }

  function handleGenerate() {
    setCopied(false);
    createInvite.mutate({}, {
      onSuccess: (result) => setInvite(result),
    });
  }

  async function handleCopy() {
    if (!invite?.inviteCode) return;

    try {
      await navigator.clipboard.writeText(invite.inviteCode);
      setCopied(true);
    } catch (error) {
      setCopied(false);
      console.error('Failed to copy invite code:', error);
    }
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={t('invite.modalTitle')}>
      <Stack gap="md" align="stretch">
        <Text size="sm" className="web-modal__muted">
          {t('invite.description')}
        </Text>

        {!invite && (
          <Button loading={createInvite.isPending} onClick={handleGenerate}>
            {createInvite.isPending ? t('invite.loading') : t('invite.generate')}
          </Button>
        )}

        {createInvite.isError && (
          <Alert color="red" variant="light">
            {getFamilyErrorMessage(createInvite.error, t, 'invite')}
          </Alert>
        )}

        {invite && (
          <Stack gap="sm" align="stretch">
            <Text size="sm" fw={500}>
              {t('invite.codeLabel')}
            </Text>
            <Text ff="monospace" size="xl" fw={700} className="web-modal__code">
              {invite.inviteCode}
            </Text>
            <Text size="sm" className="web-modal__muted">
              {t('invite.expiresAt', { expiresAt: formatExpiresAt(invite.expiresAt) })}
            </Text>
            <Button variant="light" onClick={handleCopy}>
              {copied ? t('invite.copied') : t('invite.copy')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}
