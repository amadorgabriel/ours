'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

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

  const activeFamily = useMemo(() => {
    if (!familyId || !session) return null;
    return session.families.find((family) => family.id === familyId) ?? null;
  }, [familyId, session]);

  const isAdmin = activeFamily?.role === 'Admin';

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
            {activeFamily ? (
              <>
                <Stack gap={4} align="stretch">
                  <Text fw={600} size="lg">
                    {activeFamily.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {activeFamily.role === 'Admin'
                      ? tDashboard('roleAdmin')
                      : tDashboard('roleMember')}
                  </Text>
                </Stack>
                {isAdmin && (
                  <Button onClick={() => setInviteOpen(true)} className="w-full sm:w-auto">
                    {tFamily('dashboardCta')}
                  </Button>
                )}
              </>
            ) : (
              <Text c="dimmed" size="sm">
                {tDashboard('noActiveFamily')}
              </Text>
            )}
          </Stack>
        </SurfaceCard>
      </Page>

      <InviteModal opened={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
