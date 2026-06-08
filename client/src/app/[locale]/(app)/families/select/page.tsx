import { setRequestLocale } from 'next-intl/server';

import { FamilySelectPage } from '@/presentation/modules/family/select';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FamilySelectPage />;
}
