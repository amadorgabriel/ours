import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { ptBR } from './locales/pt-BR';

const i18n = new I18n({ 'pt-BR': ptBR });

const deviceLocale = getLocales()[0]?.languageTag ?? 'pt-BR';
i18n.locale = deviceLocale.startsWith('pt') ? 'pt-BR' : deviceLocale;
i18n.defaultLocale = 'pt-BR';
i18n.enableFallback = true;

export function t(scope: string, options?: Record<string, string | number>): string {
  return i18n.t(scope, options);
}

export { i18n };
