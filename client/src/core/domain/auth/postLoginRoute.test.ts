import { describe, expect, it } from 'vitest';

import { resolvePostLoginRoute, type AuthResponse } from './types';

function makeAuthResponse(
  isNewUser: boolean,
  familyCount: number,
): AuthResponse {
  return {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      picture: null,
      families: Array.from({ length: familyCount }, (_, i) => ({
        id: `family-${i + 1}`,
        name: `Family ${i + 1}`,
        role: i === 0 ? 'Admin' : 'Member',
      })),
    },
    isNewUser,
    familyCount,
  };
}

describe('resolvePostLoginRoute', () => {
  it('new user with 0 families → /onboarding', () => {
    const response = makeAuthResponse(true, 0);
    expect(resolvePostLoginRoute(response)).toBe('/onboarding');
  });

  it('new user with 1 family → /onboarding (newUser takes precedence)', () => {
    // Caso hipotético - na prática newUser sempre tem 0 families
    const response = makeAuthResponse(true, 1);
    expect(resolvePostLoginRoute(response)).toBe('/onboarding');
  });

  it('existing user with 0 families → /onboarding', () => {
    const response = makeAuthResponse(false, 0);
    expect(resolvePostLoginRoute(response)).toBe('/onboarding');
  });

  it('existing user with 1 family → /dashboard', () => {
    const response = makeAuthResponse(false, 1);
    expect(resolvePostLoginRoute(response)).toBe('/dashboard');
  });

  it('existing user with 2 families → /families/select', () => {
    const response = makeAuthResponse(false, 2);
    expect(resolvePostLoginRoute(response)).toBe('/families/select');
  });

  it('existing user with 5 families → /families/select', () => {
    const response = makeAuthResponse(false, 5);
    expect(resolvePostLoginRoute(response)).toBe('/families/select');
  });
});
