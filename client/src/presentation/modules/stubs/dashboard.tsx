'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Button } from '@/ui/DataDisplay/Button';
import { Title } from '@/ui/DataDisplay/Title';
import { Container } from '@/ui/Layout/Container';
import { Stack } from '@/ui/Layout/Stack';

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
      <Container className="py-10" size="sm">
        <Stack gap="lg" align="stretch">
          <Title order={2}>{tDashboard('title')}</Title>
          <Stack gap="sm" align="stretch">
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
        </Stack>
      </Container>

      <InviteModal opened={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
