import { describe, expect, it } from 'vitest';

import { getAuthGuardRedirect, getGuestGuardRedirect } from './auth-redirect';

describe('auth redirect helpers', () => {
  describe('getAuthGuardRedirect', () => {
    it('WHEN session loading THEN SHALL not redirect', () => {
      expect(getAuthGuardRedirect(true, false)).toBeNull();
    });

    it('WHEN not authenticated THEN SHALL redirect to login', () => {
      expect(getAuthGuardRedirect(false, false)).toBe('/login');
    });

    it('WHEN authenticated THEN SHALL not redirect', () => {
      expect(getAuthGuardRedirect(false, true)).toBeNull();
    });
  });

  describe('getGuestGuardRedirect', () => {
    it('WHEN session loading THEN SHALL not redirect', () => {
      expect(getGuestGuardRedirect(true, true, 1)).toBeNull();
    });

    it('WHEN authenticated with one family THEN SHALL redirect to dashboard', () => {
      expect(getGuestGuardRedirect(false, true, 1)).toBe('/dashboard');
    });

    it('WHEN authenticated with no family THEN SHALL redirect to onboarding', () => {
      expect(getGuestGuardRedirect(false, true, 0)).toBe('/onboarding');
    });
  });
});
