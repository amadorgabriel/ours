import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ThemeSchemeTools } from '@/modules/dev-theme/presentation/ThemeSchemeTools';

export const metadata: Metadata = {
  title: 'Dev — tema',
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DevThemePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ThemeSchemeTools />;
}
