import { Container } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { hasActiveSession } from '@/core/services/auth/authSession';
import { routing } from '@/i18n/routing';
import { LoginWithGoogle } from '@/presentation/modules/auth';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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
