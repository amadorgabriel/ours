'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { IconBrandGoogle } from '@/ui/General/Icon';
import { Container } from '@/ui/Layout/Container';
import { Stack } from '@/ui/Layout/Stack';

export function HomePage() {
  const t = useTranslations('home');

  return (
    <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
      <Stack gap="lg" align="stretch">
        <Title order={1}>{t('title')}</Title>
        <Text size="lg" c="dimmed">
          {t('subtitle')}
        </Text>
        <Button
          component={Link}
          href="/login"
          leftSection={<IconBrandGoogle size={20} aria-hidden />}
          size="md"
          variant="filled"
        >
          {t('ctaGoogle')}
        </Button>
      </Stack>
    </Container>
  );
}
