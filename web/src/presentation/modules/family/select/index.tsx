'use client';

import { useTranslations } from 'next-intl';

import { useMyFamilies } from '@/core/services/usecases/family/index.hooks';
import { useRouter } from '@/i18n/navigation';
import { routes } from '@/i18n/routes';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Alert } from '@/ui/Feedback/Alert';
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
    router.replace(routes.dashboard);
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

        <div className="grid gap-4 sm:grid-cols-2">
          {families.map((family) => (
            <SurfaceCard key={family.id} className="web-family-card">
              <button
                type="button"
                className="web-family-card__button"
                onClick={() => handleSelect(family.id)}
              >
                <Stack gap="sm" align="stretch">
                  <Text fw={600}>{family.name}</Text>
                  <Text size="sm" c="dimmed">
                    {roleLabel(family.role)}
                  </Text>
                  <Text size="sm" fw={500} style={{ color: 'var(--color-trust-blue)' }}>
                    {t('selectButton')}
                  </Text>
                </Stack>
              </button>
            </SurfaceCard>
          ))}
        </div>
      </Stack>
    </Page>
  );
}
