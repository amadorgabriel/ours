import { setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/modules/home/presentation/HomePage';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col flex-1 items-stretch bg-zinc-50 dark:bg-zinc-950">
      <HomePage />
    </div>
  );
}
