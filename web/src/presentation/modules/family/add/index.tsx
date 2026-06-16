'use client';

import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/ui/DataDisplay/Button';
import { Container } from '@/ui/Layout/Container';
import { Stack } from '@/ui/Layout/Stack';

import { FamilySetupForms } from '../setup-forms';

export function FamilyAddPage() {
  const t = useTranslations('family.add');
  const router = useRouter();

  return (
    <Container className="py-10" size="sm">
      <Stack gap="md" align="stretch">
        <Button component={Link} href="/dashboard" variant="subtle" size="compact-sm">
          {t('backToDashboard')}
        </Button>
        <FamilySetupForms variant="additional" onSuccess={() => router.replace('/dashboard')} />
      </Stack>
    </Container>
  );
}
