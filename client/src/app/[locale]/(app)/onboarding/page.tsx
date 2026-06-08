import { setRequestLocale } from 'next-intl/server';

import { OnboardingStubPage } from '@/presentation/modules/stubs/onboarding';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OnboardingStubPage />;
}
