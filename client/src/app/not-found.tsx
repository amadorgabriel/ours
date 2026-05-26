import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';

import { MantineColorSchemeBootstrap } from '@/presentation/theme/MantineColorSchemeBootstrap';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Global not-found outside of [locale] - hardcoded pt strings as fallback
// The localized version in [locale]/not-found.tsx should be preferred
export default function GlobalNotFound() {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="bg-gray-50"
        suppressHydrationWarning
      >
        <MantineColorSchemeBootstrap />
        <div style={{ minHeight: '100vh' }}>
          <NotFoundPageContent />
        </div>
      </body>
    </html>
  );
}

// Simple content without i18n since we're outside the locale context
function NotFoundPageContent() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold text-gray-500 uppercase">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">Página não encontrada</h1>
      <p className="mt-3 text-lg text-gray-600">O endereço pode estar incorreto ou a página foi movida.</p>
      <p className="mt-8">
        <Link
          href="/"
          className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Voltar ao início
        </Link>
      </p>
    </main>
  );
}
