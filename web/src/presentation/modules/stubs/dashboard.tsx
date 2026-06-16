'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

import { InviteModal } from '../family/invite';

export function DashboardPage() {
  const tDashboard = useTranslations('app.dashboard');
  const tFamily = useTranslations('family.invite');
  const { session } = useAuth();
  const { familyId } = useFamily();
  const [inviteOpen, setInviteOpen] = useState(false);

  const isAdmin = useMemo(() => {
    if (!familyId || !session) return false;
    return session.families.some((family) => family.id === familyId && family.role === 'Admin');
  }, [familyId, session]);

  const hasMultipleFamilies = (session?.familyCount ?? 0) > 1;

  return (
    <>
      <Page
        header={
          <Stack gap="xs" align="stretch">
            <Title order={2}>{tDashboard('title')}</Title>
            <Text c="dimmed">{tDashboard('subtitle')}</Text>
          </Stack>
        }
      >
        <SurfaceCard>
          <Stack gap="md" align="stretch">
            <Button component={Link} href="/families/add" variant="light">
              {tDashboard('addFamily')}
            </Button>
            {hasMultipleFamilies && (
              <Button component={Link} href="/families/select" variant="subtle">
                {tDashboard('switchFamily')}
              </Button>
            )}
            {isAdmin && (
              <Button onClick={() => setInviteOpen(true)}>{tFamily('dashboardCta')}</Button>
            )}
          </Stack>
        </SurfaceCard>
      </Page>

      <InviteModal opened={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
