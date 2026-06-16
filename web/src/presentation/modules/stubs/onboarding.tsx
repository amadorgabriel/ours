'use client';

import { useTranslations } from 'next-intl';

import { Title } from '@/ui/DataDisplay/Title';
import { Container } from '@/ui/Layout/Container';

export function OnboardingStubPage() {
  const t = useTranslations('app.onboarding');

  return (
    <Container className="py-10" size="sm">
      <Title order={2}>{t('title')}</Title>
    </Container>
  );
}
