import { setRequestLocale } from 'next-intl/server';

import { OnboardingPage } from '@/presentation/modules/family/onboarding';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OnboardingPage />;
}
