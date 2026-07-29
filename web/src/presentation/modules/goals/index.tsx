'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { Goal } from '@/core/domain/goal';
import { useGoals } from '@/core/services/usecases/goal/index.hooks';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { CreateGoalModal } from './create-goal-modal';
import { formatCurrency, goalProgressPercent } from './format';
import { GoalDetailModal } from './goal-detail-modal';

function GoalListItem({ goal, onSelect }: { goal: Goal; onSelect: () => void }) {
  const progress = goalProgressPercent(goal.currentAmount, goal.targetAmount);

  return (
    <button type="button" className="w-full text-left" onClick={onSelect}>
      <SurfaceCard className="transition-opacity hover:opacity-90">
        <Stack gap="sm" align="stretch">
          <Stack gap={0} align="stretch" className="sm:flex-row sm:items-start sm:justify-between">
            <Text fw={600}>{goal.title}</Text>
            <Text size="sm" c="dimmed">
              {progress}%
            </Text>
          </Stack>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-[var(--mantine-color-green-6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Text size="sm" c="dimmed">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </Text>
        </Stack>
      </SurfaceCard>
    </button>
  );
}

export function GoalsPage() {
  const t = useTranslations('goals');
  const { session } = useAuth();
  const { familyId } = useFamily();
  const { data, isLoading, isError, refetch } = useGoals();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeFamily = useMemo(() => {
    if (!familyId || !session) return null;
    return session.families.find((family) => family.id === familyId) ?? null;
  }, [familyId, session]);

  const isAdmin = activeFamily?.role === 'Admin';
  const items = data?.items ?? [];

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
            {items.map((goal) => (
              <GoalListItem key={goal.id} goal={goal} onSelect={() => setSelectedGoal(goal)} />
            ))}
          </Stack>
        )}
      </Page>

      <CreateGoalModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <GoalDetailModal
        goal={selectedGoal}
        opened={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
      />
    </>
  );
}
