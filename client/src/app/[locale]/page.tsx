import { redirect } from 'next/navigation';

import { hasActiveSession } from '@/core/services/auth/authSession';
import { routing } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const isDefaultLocale = locale === routing.defaultLocale;

  if (await hasActiveSession()) {
    const welcomePath = isDefaultLocale ? '/welcome' : `/${locale}/welcome`;
    redirect(welcomePath);
  }

  const loginPath = isDefaultLocale ? '/login' : `/${locale}/login`;
  redirect(loginPath);
}
