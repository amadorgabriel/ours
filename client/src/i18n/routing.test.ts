import { describe, expect, it } from 'vitest';
import { routing } from '@/i18n/routing';

describe('i18n routing', () => {
  it('default locale is pt-BR', () => {
    expect(routing.defaultLocale).toBe('pt-BR');
  });
});
