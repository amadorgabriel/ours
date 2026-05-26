import { Button, Container, Stack, Title, Text } from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');

  return (
    <Container size="sm" py="md">
      <Stack gap="lg">
        <Title order={1}>{t('title')}</Title>

        {/* Botão principal: Liguei Agora */}
        <Button
          size="xl"
          fullWidth
          leftSection={<IconPhone size={24} />}
          variant="gradient"
          gradient={{ from: 'green', to: 'teal' }}
          radius="md"
          styles={{
            root: {
              height: 120,
            },
          }}
        >
          <Stack gap={4} align="center">
            <Text size="lg" fw={700}>
              {t('callNow.button')}
            </Text>
            <Text size="sm" opacity={0.9}>
              {t('callNow.hint')}
            </Text>
          </Stack>
        </Button>

        {/* Resumo da semana */}
        <div>
          <Title order={2} size="h3">
            {t('weeklySummary')}
          </Title>
          <Text c="dimmed" size="sm">
            {t('placeholder')}
          </Text>
        </div>

        {/* Feed de atividades */}
        <div>
          <Title order={2} size="h3">
            {t('activityFeed')}
          </Title>
          <Text c="dimmed" size="sm">
            {t('placeholder')}
          </Text>
        </div>

        {/* Logout temporário para testes */}
        <form action="/api/auth/logout" method="POST">
          <Button type="submit" variant="light" color="gray" fullWidth>
            {t('logout')}
          </Button>
        </form>
      </Stack>
    </Container>
  );
}
