'use client';

import { useTranslations } from 'next-intl';

import { useMyFamilies } from '@/core/services/usecases/family/index.hooks';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Page } from '@/ui/Layout/Page';
import { Stack } from '@/ui/Layout/Stack';
import { SurfaceCard } from '@/ui/Layout/SurfaceCard';

export function FamilySelectPage() {
  const t = useTranslations('family.select');
  const router = useRouter();
  const { session } = useAuth();
  const { setFamilyId } = useFamily();
  const { data: listedFamilies, isLoading, isError } = useMyFamilies();

  const families = listedFamilies ?? session?.families ?? [];

  function handleSelect(familyId: string) {
    setFamilyId(familyId);
    router.replace('/dashboard');
  }

  function roleLabel(role: 'Admin' | 'Member') {
    return role === 'Admin' ? t('roleAdmin') : t('roleMember');
  }

  return (
    <Page
      size="lg"
      header={
        <Stack gap="xs" align="stretch">
          <Title order={2}>{t('title')}</Title>
          <Text c="dimmed">{t('subtitle')}</Text>
        </Stack>
      }
    >
      <Stack gap="md" align="stretch">
        {isLoading && (
          <Text c="dimmed" size="sm">
            {t('loading')}
          </Text>
        )}

        {isError && (
          <Alert color="red" variant="light">
            {t('empty')}
          </Alert>
        )}

        {!isLoading && families.length === 0 && (
          <Text c="dimmed" size="sm">
            {t('empty')}
          </Text>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {families.map((family) => (
            <SurfaceCard key={family.id}>
              <Stack gap="sm" align="stretch">
                <Text fw={600}>{family.name}</Text>
                <Text size="sm" c="dimmed">
                  {roleLabel(family.role)}
                </Text>
                <Button onClick={() => handleSelect(family.id)}>{t('selectButton')}</Button>
              </Stack>
            </SurfaceCard>
          ))}
        </div>

        <Button component={Link} href="/families/add" variant="light" w="fit-content">
          {t('addFamilyLink')}
        </Button>
      </Stack>
    </Page>
  );
}
