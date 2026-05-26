import { Container } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { hasActiveSession } from '@/core/services/auth/authSession';
import { routing } from '@/i18n/routing';
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

  // Se já tem sessão ativa, redireciona para welcome (por enquanto)
  // TODO: Implementar smart routing (onboarding/dashboard/select) quando backend tiver endpoint /me
  if (await hasActiveSession()) {
    const welcomePath = locale === routing.defaultLocale ? '/welcome' : `/${locale}/welcome`;
    redirect(welcomePath);
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
      <LoginWithGoogle />
    </Container>
  );
}
