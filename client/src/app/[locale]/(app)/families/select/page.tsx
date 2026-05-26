import { Container, Title, Text, Stack, Button, Card } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SelectFamilyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('families.select');

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed">{t('description')}</Text>
        </div>

        {/* Lista placeholder de famílias */}
        <Stack gap="md">
          <Card withBorder>
            <Text fw={500}>Família Silva</Text>
            <Text size="sm" c="dimmed">
              Admin
            </Text>
          </Card>

          <Card withBorder>
            <Text fw={500}>Família Oliveira</Text>
            <Text size="sm" c="dimmed">
              Membro
            </Text>
          </Card>
        </Stack>

        <Button variant="light" fullWidth>
          {t('createNew')}
        </Button>
      </Stack>
    </Container>
  );
}
