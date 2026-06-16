import { describe, expect, it } from 'vitest';

import { getAuthGuardRedirect, getGuestGuardRedirect, getHomeRedirect } from './auth-redirect';

describe('auth redirect helpers', () => {
  describe('getHomeRedirect', () => {
    it('WHEN session loading THEN SHALL not redirect', () => {
      expect(getHomeRedirect(true, false, undefined)).toBeNull();
    });

    it('WHEN logged out THEN SHALL redirect to login', () => {
      expect(getHomeRedirect(false, false, undefined)).toBe('/login');
    });

    it('WHEN logged in with one family THEN SHALL redirect to dashboard', () => {
      expect(getHomeRedirect(false, true, 1)).toBe('/dashboard');
    });

    it('WHEN logged in with no family THEN SHALL redirect to onboarding', () => {
      expect(getHomeRedirect(false, true, 0)).toBe('/onboarding');
    });

    it('WHEN logged in with multiple families THEN SHALL redirect to family select', () => {
      expect(getHomeRedirect(false, true, 2)).toBe('/families/select');
    });
  });

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

    it('WHEN authenticated with multiple families THEN SHALL redirect to family select', () => {
      expect(getGuestGuardRedirect(false, true, 2)).toBe('/families/select');
    });

    it('WHEN not authenticated THEN SHALL not redirect', () => {
      expect(getGuestGuardRedirect(false, false, undefined)).toBeNull();
    });
  });
});
