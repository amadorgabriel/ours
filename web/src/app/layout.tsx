import '@mantine/core/styles.css';
import '@/presentation/styles/globals.css';

import { Urbanist } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata, Viewport } from 'next';

import { routing } from '@/i18n/routing';
import { RootProvider } from '@/presentation/providers';
import { designTokens } from '@/presentation/styles/design-tokens';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  weight: ['400', '500', '600', '700', '800'],
});

const locale = routing.defaultLocale;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: designTokens.colors.serenityGreen,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      title: t('title'),
    },
  };
}

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${urbanist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <RootProvider>{children}</RootProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
