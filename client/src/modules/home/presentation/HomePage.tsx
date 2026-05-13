'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

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
          type="button"
        >
          {t('ctaGoogle')}
        </Button>
      </Stack>
    </Container>
  );
}
