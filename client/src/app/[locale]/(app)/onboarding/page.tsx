import { Container, Title, Text, Button, Stack, TextInput } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('onboarding');

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>{t('title')}</Title>
          <Text c="dimmed">{t('description')}</Text>
        </div>

        <TextInput
          label={t('familyNameLabel')}
          placeholder={t('familyNamePlaceholder')}
          required
        />

        <Button size="lg" fullWidth>
          {t('createFamily')}
        </Button>

        <Text size="sm" c="dimmed">
          {t('adminNote')}
        </Text>
      </Stack>
    </Container>
  );
}
