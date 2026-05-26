import { setRequestLocale } from 'next-intl/server';

import { DashboardPage } from '@/presentation/modules/dashboard';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardPage />;
}