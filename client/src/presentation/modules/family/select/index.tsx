'use client';

import { useTranslations } from 'next-intl';

import { useMyFamilies } from '@/core/services/usecases/family/index.hooks';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';
import { Alert } from '@/ui/Feedback/Alert';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Container } from '@/ui/Layout/Container';
import { Stack } from '@/ui/Layout/Stack';

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
    <Container className="py-10" size="sm">
      <Stack gap="lg" align="stretch">
        <Stack gap="sm" align="stretch">
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed">{t('subtitle')}</Text>
        </Stack>

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

        {families.map((family) => (
          <Stack
            key={family.id}
            gap="xs"
            align="stretch"
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <Text fw={600}>{family.name}</Text>
            <Text size="sm" c="dimmed">
              {roleLabel(family.role)}
            </Text>
            <Button onClick={() => handleSelect(family.id)}>{t('selectButton')}</Button>
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}
