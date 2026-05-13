import { Container } from '@mantine/core';
import { setRequestLocale } from 'next-intl/server';
import { LoginWithGoogle } from '@/modules/auth/presentation/LoginWithGoogle';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container className="flex flex-1 flex-col justify-center py-16" size="sm">
      <LoginWithGoogle />
    </Container>
  );
}
