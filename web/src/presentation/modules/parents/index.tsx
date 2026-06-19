'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { ParentSummary } from '@/core/domain/parent';
import { useParents } from '@/core/services/usecases/parent/index.hooks';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { CreateParentModal } from './create-parent-modal';
import { ParentDetailModal } from './parent-detail-modal';

function ParentListItem({
  parent,
  onSelect,
}: {
  parent: ParentSummary;
  onSelect: () => void;
}) {
  return (
    <button type="button" className="w-full text-left" onClick={onSelect}>
      <SurfaceCard className="transition-opacity hover:opacity-90">
        <Stack gap={4} align="stretch">
          <Text fw={600}>{parent.name}</Text>
          <Text size="sm" c="dimmed">
            {parent.relationship}
            {parent.birthDate ? ` · ${parent.birthDate}` : ''}
          </Text>
        </Stack>
      </SurfaceCard>
    </button>
  );
}

export function ParentsPage() {
  const t = useTranslations('parents');
  const { session } = useAuth();
  const { familyId } = useFamily();
  const { data: parents, isLoading, isError, refetch } = useParents();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const activeFamily = useMemo(() => {
    if (!familyId || !session) return null;
    return session.families.find((family) => family.id === familyId) ?? null;
  }, [familyId, session]);

  const isAdmin = activeFamily?.role === 'Admin';
  const items = parents ?? [];

  return (
    <>
      <Page
        header={
          <Stack gap="xs" align="stretch" className="sm:flex-row sm:items-center sm:justify-between">
            <Stack gap="xs" align="stretch">
              <Title order={2}>{t('title')}</Title>
              <Text c="dimmed">{t('subtitle')}</Text>
            </Stack>
            {isAdmin && items.length > 0 && (
              <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
                {t('createCta')}
              </Button>
            )}
          </Stack>
        }
      >
        {!familyId ? (
          <Alert color="yellow" variant="light">
            {t('noFamily')}
          </Alert>
        ) : isLoading ? (
          <Text c="dimmed">{t('loading')}</Text>
        ) : isError ? (
          <Stack gap="md" align="stretch">
            <Alert color="red" variant="light">
              {t('loadError')}
            </Alert>
            <Button variant="light" onClick={() => void refetch()}>
              {t('retry')}
            </Button>
          </Stack>
        ) : items.length === 0 ? (
          <SurfaceCard>
            <Stack gap="md" align="stretch">
              <Text fw={600}>{t('emptyTitle')}</Text>
              <Text size="sm" c="dimmed">
                {isAdmin ? t('emptyAdmin') : t('emptyMember')}
              </Text>
              {isAdmin && (
                <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
                  {t('createCta')}
                </Button>
              )}
            </Stack>
          </SurfaceCard>
        ) : (
          <Stack gap="md" align="stretch">
            {items.map((parent) => (
              <ParentListItem
                key={parent.id}
                parent={parent}
                onSelect={() => setSelectedParentId(parent.id)}
              />
            ))}
          </Stack>
        )}
      </Page>

      <CreateParentModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <ParentDetailModal
        key={selectedParentId ?? 'none'}
        parentId={selectedParentId}
        opened={selectedParentId !== null}
        isAdmin={isAdmin}
        onClose={() => setSelectedParentId(null)}
      />
    </>
  );
}
