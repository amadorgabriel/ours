import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { ThemeSchemeTools } from '@/presentation/modules/dev-theme';

export const metadata: Metadata = {
  title: 'Theme',
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
