import '@/presentation/styles/globals.css';

import { Urbanist } from 'next/font/google';
import Link from 'next/link';

import messages from '@/i18n/messages/pt-BR.json';

const copy = messages.notFound;

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  weight: ['400', '500', '600', '700'],
});

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" className={`${urbanist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <main className="mx-auto flex min-h-screen max-w-md flex-1 flex-col justify-center px-6 py-16">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            {copy.title}
          </h1>
          <p className="mt-3 text-lg text-[var(--color-mindful-brown)]">{copy.description}</p>
          <p className="mt-8">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex rounded-[var(--radius-md)] bg-[var(--color-serenity-green)] px-4 py-2 text-sm font-medium text-[var(--color-text-light)]"
            >
              {copy.homeLink}
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
