import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

describe('i18n routing', () => {
  it('default locale is pt', () => {
    expect(routing.defaultLocale).toBe('pt');
  });

  it('supports pt and en locales', () => {
    expect(routing.locales).toContain('pt');
    expect(routing.locales).toContain('en');
    expect(routing.locales).toHaveLength(2);
  });

  it('uses as-needed locale prefix', () => {
    expect(routing.localePrefix).toBe('as-needed');
  });
});
