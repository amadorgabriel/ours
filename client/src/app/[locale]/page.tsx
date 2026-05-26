import { redirect } from '@/i18n/navigation';

import { hasActiveSession } from '@/core/services/auth/authSession';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  if (await hasActiveSession()) {
    redirect({ href: '/dashboard', locale });
  }

  redirect({ href: '/login', locale });
}
