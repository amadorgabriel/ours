import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const loginPath = locale === routing.defaultLocale ? '/login' : `/${locale}/login`;

  redirect(loginPath);
}
