import { describe, expect, it } from 'vitest';

import { resolvePostLoginRoute } from './resolve-post-login-route';

describe('resolvePostLoginRoute', () => {
  it('WHEN familyCount is 0 THEN SHALL route to onboarding', () => {
    expect(resolvePostLoginRoute(0)).toBe('/onboarding');
  });

  it('WHEN familyCount is 1 THEN SHALL route to dashboard', () => {
    expect(resolvePostLoginRoute(1)).toBe('/dashboard');
  });

  it('WHEN familyCount is greater than 1 THEN SHALL route to family select', () => {
    expect(resolvePostLoginRoute(2)).toBe('/families/select');
    expect(resolvePostLoginRoute(5)).toBe('/families/select');
  });
});
