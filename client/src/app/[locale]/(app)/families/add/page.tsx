import { setRequestLocale } from 'next-intl/server';

import { FamilyAddPage } from '@/presentation/modules/family/add';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FamilyAddPage />;
}
