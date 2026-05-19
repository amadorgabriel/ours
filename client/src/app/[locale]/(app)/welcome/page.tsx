import { setRequestLocale } from 'next-intl/server';

import { WelcomePage as WelcomePageContent } from '@/presentation/modules/home';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function WelcomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WelcomePageContent />;
}
