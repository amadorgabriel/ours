'use client';

import { Box, Button, Container, Stack, Text, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

interface NotFoundPageProps {
  showHomeLink?: boolean;
}

export function NotFoundPage({ showHomeLink = true }: NotFoundPageProps) {
  const t = useTranslations('notFound');

  return (
    <Box
      component="main"
      className="flex flex-1 flex-col bg-gray-50"
      style={{ minHeight: '100vh' }}
    >
      <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
        <Stack gap="lg" align="stretch">
          <Text size="sm" c="dimmed" fw={600} tt="uppercase">
            404
          </Text>
          <Title order={1} size="h2">
            {t('title')}
          </Title>
          <Text size="lg" c="dimmed">
            {t('description')}
          </Text>
          {showHomeLink && (
            <Button
              component={Link}
              href="/"
              variant="filled"
              size="md"
              prefetch={false}
              mt="md"
            >
              {t('homeLink')}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
