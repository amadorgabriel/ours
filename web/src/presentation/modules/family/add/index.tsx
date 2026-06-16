'use client';

import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/ui/DataDisplay/Button';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';

import { FamilySetupForms } from '../setup-forms';

export function FamilyAddPage() {
  const t = useTranslations('family.add');
  const router = useRouter();

  return (
    <Page size="xl">
      <Stack gap="md" align="stretch">
        <Button component={Link} href="/dashboard" variant="subtle" size="compact-sm" w="fit-content">
          {t('backToDashboard')}
        </Button>
        <FamilySetupForms variant="additional" onSuccess={() => router.replace('/dashboard')} />
      </Stack>
    </Page>
  );
}
