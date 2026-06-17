import {
  resolvePostLoginRoute,
  getAuthGuardRedirect,
  getGuestGuardRedirect,
  getHomeRedirect,
} from '../auth-redirect';

describe('auth-redirect', () => {
  describe('resolvePostLoginRoute', () => {
    it('routes to onboarding when no families', () => {
      expect(resolvePostLoginRoute(0)).toBe('/(auth)/onboarding');
    });

    it('routes to home when one family', () => {
      expect(resolvePostLoginRoute(1)).toBe('/(app)');
    });

    it('routes to family select when multiple families', () => {
      expect(resolvePostLoginRoute(2)).toBe('/(app)/families/select');
    });
  });

  describe('getAuthGuardRedirect', () => {
    it('returns login when unauthenticated', () => {
      expect(getAuthGuardRedirect(false, false)).toBe('/(auth)/login');
    });

    it('returns null when authenticated', () => {
      expect(getAuthGuardRedirect(false, true)).toBeNull();
    });
  });

  describe('getGuestGuardRedirect', () => {
    it('returns null for guests', () => {
      expect(getGuestGuardRedirect(false, false, undefined)).toBeNull();
    });

    it('redirects authenticated user with one family', () => {
      expect(getGuestGuardRedirect(false, true, 1)).toBe('/(app)');
    });
  });

  describe('getHomeRedirect', () => {
    it('returns login when logged out', () => {
      expect(getHomeRedirect(false, false, undefined)).toBe('/(auth)/login');
    });
  });
});
