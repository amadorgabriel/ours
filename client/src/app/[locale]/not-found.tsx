'use client';

import { Box } from '@mantine/core';

import { Button } from '@/ui/DataDisplay/Button';
import { Text } from '@/ui/DataDisplay/Text';
import { Title } from '@/ui/DataDisplay/Title';
import { Container } from '@/ui/Layout/Container';
import { Stack } from '@/ui/Layout/Stack';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export default function LocaleNotFound() {
  const t = useTranslations('notFound');

  return (
    <Box
      component="div"
      className="flex flex-1 flex-col"
      style={{ backgroundColor: 'var(--mantine-color-body)', minHeight: '100%' }}
    >
      <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
        <Stack gap="lg" align="stretch">
          <Text size="sm" c="dimmed" fw={600}>
            404
          </Text>
          <Title order={1}>{t('title')}</Title>
          <Text size="lg" c="dimmed">
            {t('description')}
          </Text>
          <Button component={Link} href="/" variant="filled" size="md" prefetch={false}>
            {t('homeLink')}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
