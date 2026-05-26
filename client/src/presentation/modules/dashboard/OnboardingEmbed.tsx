'use client';

import { Button, Card, Container, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconHeartHandshake } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface OnboardingEmbedProps {
  onComplete?: (familyName: string) => void;
}

export function OnboardingEmbed({ onComplete }: OnboardingEmbedProps) {
  const t = useTranslations('onboarding');
  const [familyName, setFamilyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!familyName.trim()) return;
    setIsSubmitting(true);
    // TODO: Call API to create family
    onComplete?.(familyName);
    setIsSubmitting(false);
  };

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Stack gap="xs" align="center">
          <IconHeartHandshake size={48} color="var(--mantine-color-blue-6)" />
          <Title order={1} ta="center">
            {t('title')}
          </Title>
          <Text c="dimmed" ta="center">
            {t('description')}
          </Text>
        </Stack>

        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <TextInput
              label={t('familyNameLabel')}
              placeholder={t('familyNamePlaceholder')}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              size="md"
              required
            />
            <Button
              size="lg"
              fullWidth
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!familyName.trim()}
            >
              {t('createFamily')}
            </Button>
          </Stack>
        </Card>

        <Text size="sm" c="dimmed" ta="center">
          {t('adminNote')}
        </Text>
      </Stack>
    </Container>
  );
}