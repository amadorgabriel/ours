import { setRequestLocale } from 'next-intl/server';

import { LoginPage } from '@/presentation/modules/auth/login';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <LoginPage />
    </div>
  );
}
