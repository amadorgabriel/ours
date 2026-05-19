import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';

import messages from '@/i18n/messages/pt-BR.json';
import { MantineColorSchemeBootstrap } from '@/presentation/theme/MantineColorSchemeBootstrap';

const copy = messages.notFound;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function GlobalNotFound() {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
        suppressHydrationWarning
      >
        <MantineColorSchemeBootstrap />
        <main className="mx-auto flex min-h-screen max-w-md flex-1 flex-col justify-center px-6 py-16">
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">{copy.description}</p>
          <p className="mt-8">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {copy.homeLink}
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
