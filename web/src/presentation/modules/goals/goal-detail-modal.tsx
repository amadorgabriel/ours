'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { Goal, GoalContribution } from '@/core/domain/goal';
import { useGoalContributions, useGoals } from '@/core/services/usecases/goal/index.hooks';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Modal } from '@/ui/Feedback/Modal';
import { Divider } from '@/ui/Layout/Divider';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { ContributeModal } from './contribute-modal';
import {
  formatContributionDate,
  formatCurrency,
  formatGoalDate,
  goalProgressPercent,
} from './format';

type GoalDetailModalProps = {
  opened: boolean;
  goal: Goal | null;
  onClose: () => void;
};

function ContributionRow({ contribution }: { contribution: GoalContribution }) {
  return (
    <Stack gap={4} align="stretch" className="py-3 border-b border-black/5 last:border-0">
      <Stack gap={0} align="stretch" className="sm:flex-row sm:items-center sm:justify-between">
        <Text fw={600} size="sm">
          {contribution.userName}
        </Text>
        <Text fw={600} size="sm">
          {contribution.amount !== null ? formatCurrency(contribution.amount) : '—'}
        </Text>
      </Stack>
      <Text size="xs" c="dimmed">
        {formatContributionDate(contribution.createdAt)}
      </Text>
    </Stack>
  );
}

export function GoalDetailModal({ opened, goal, onClose }: GoalDetailModalProps) {
  const t = useTranslations('goals');
  const [contributeOpen, setContributeOpen] = useState(false);
  const { data: goalsData } = useGoals();
  const {
    data: contributionsData,
    isLoading: contributionsLoading,
  } = useGoalContributions(opened && goal ? goal.id : null);

  if (!goal) {
    return null;
  }

  const liveGoal = goalsData?.items.find((item) => item.id === goal.id) ?? goal;
  const remaining = Math.max(0, liveGoal.targetAmount - liveGoal.currentAmount);
  const progress = goalProgressPercent(liveGoal.currentAmount, liveGoal.targetAmount);
  const contributions = contributionsData?.items ?? [];

  return (
    <>
      <Modal opened={opened} onClose={onClose} title={liveGoal.title} size="lg">
        <Stack gap="md" align="stretch">
          <Text size="sm" c="dimmed">
            {t('detail.createdAt', { date: formatGoalDate(liveGoal.createdAt) })}
          </Text>

          <SurfaceCard>
            <Stack gap="xs" align="stretch">
              <Stack gap={0} align="stretch" className="sm:flex-row sm:justify-between">
                <Text size="sm" c="dimmed">
                  {t('detail.progress')}
                </Text>
                <Text size="sm" fw={600}>
                  {progress}%
                </Text>
              </Stack>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-[var(--mantine-color-green-6)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Stack gap={0} align="stretch" className="sm:flex-row sm:justify-between">
                <Text size="sm">
                  {formatCurrency(liveGoal.currentAmount)} / {formatCurrency(liveGoal.targetAmount)}
                </Text>
                <Text size="sm" c="dimmed">
                  {t('detail.remaining', { amount: formatCurrency(remaining) })}
                </Text>
              </Stack>
            </Stack>
          </SurfaceCard>

          <Button onClick={() => setContributeOpen(true)}>{t('detail.contributeCta')}</Button>

          <Divider />

          <Title order={4}>{t('detail.contributionsTitle')}</Title>

          {contributionsLoading && contributions.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('loading')}
            </Text>
          ) : contributions.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('detail.contributionsEmpty')}
            </Text>
          ) : (
            contributions.map((contribution) => (
              <ContributionRow key={contribution.id} contribution={contribution} />
            ))
          )}
        </Stack>
      </Modal>

      <ContributeModal
        goalId={goal.id}
        opened={contributeOpen}
        onClose={() => setContributeOpen(false)}
      />
    </>
  );
}
