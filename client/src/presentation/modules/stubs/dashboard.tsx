'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

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

  return (
    <>
      <Container className="py-10" size="sm">
        <Stack gap="lg" align="stretch">
          <Title order={2}>{tDashboard('title')}</Title>
          {isAdmin && (
            <Button onClick={() => setInviteOpen(true)}>{tFamily('dashboardCta')}</Button>
          )}
        </Stack>
      </Container>

      <InviteModal opened={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
