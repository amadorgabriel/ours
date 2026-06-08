'use client';

import { useTranslations } from 'next-intl';

import { Title } from '@/ui/DataDisplay/Title';
import { Container } from '@/ui/Layout/Container';

export function DashboardStubPage() {
  const t = useTranslations('app.dashboard');

  return (
    <Container className="py-10" size="sm">
      <Title order={2}>{t('title')}</Title>
    </Container>
  );
}
