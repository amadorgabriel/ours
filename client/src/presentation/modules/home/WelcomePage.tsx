import { Container, Text, Title } from '@mantine/core';
import { getTranslations } from 'next-intl/server';

export async function WelcomePage() {
  const t = await getTranslations('welcome');

  return (
    <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
      <Title order={1}>{t('title')}</Title>
      <Text mt="md" c="dimmed">
        {t('message')}
      </Text>
    </Container>
  );
}
