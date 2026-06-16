import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt-BR'],
  defaultLocale: 'pt-BR',
  // MVP monolíngue: URLs diretas (/login, /dashboard) sem segmento [locale]
  localePrefix: 'never',
});

export type AppLocale = (typeof routing.locales)[number];
