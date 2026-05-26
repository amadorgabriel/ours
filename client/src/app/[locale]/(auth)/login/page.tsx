import { Container } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';
import { hasActiveSession } from '@/core/services/auth/authSession';
import { LoginWithGoogle } from '@/presentation/modules/auth';

export const metadata = {
  title: 'Entrar | Project Ours',
  description: 'Cuide dos seus pais junto com seus irmãos',
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (await hasActiveSession()) {
    redirect({ href: '/dashboard', locale });
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
      <LoginWithGoogle />
    </Container>
  );
}
