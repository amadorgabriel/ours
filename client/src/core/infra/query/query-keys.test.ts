import { describe, expect, it } from 'vitest';

import { queryKeys } from './query-keys';

describe('queryKeys', () => {
  it('WHEN auth antiforgery key is built THEN SHALL be stable', () => {
    expect(queryKeys.auth.antiforgery()).toEqual(['auth', 'antiforgery']);
  });

  it('WHEN family list key is built THEN SHALL include family id', () => {
    expect(queryKeys.families.list('family-1')).toEqual(['families', 'list', 'family-1']);
  });

  it('WHEN family list key is built without id THEN SHALL use none fallback', () => {
    expect(queryKeys.families.list(null)).toEqual(['families', 'list', 'none']);
    expect(queryKeys.families.list(undefined)).toEqual(['families', 'list', 'none']);
  });
});
