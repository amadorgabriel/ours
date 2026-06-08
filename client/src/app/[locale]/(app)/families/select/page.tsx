import { setRequestLocale } from 'next-intl/server';

import { FamilySelectStubPage } from '@/presentation/modules/stubs/family-select';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FamilySelectStubPage />;
}
