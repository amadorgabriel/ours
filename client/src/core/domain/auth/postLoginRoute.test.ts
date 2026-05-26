import { describe, expect, it } from 'vitest';

import { resolvePostLoginRoute } from './types';

describe('resolvePostLoginRoute', () => {
  it('always returns /dashboard regardless of user state', () => {
    // All user states should redirect to /dashboard
    // Onboarding and family picker are now handled within the dashboard page
    expect(resolvePostLoginRoute()).toBe('/dashboard');
  });
});
