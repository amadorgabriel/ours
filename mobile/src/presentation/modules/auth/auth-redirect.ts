export const mobileRoutes = {
  login: '/(auth)/login',
  onboarding: '/(auth)/onboarding',
  home: '/(app)',
  familiesSelect: '/(app)/families/select',
} as const;

export type PostLoginRoute =
  | typeof mobileRoutes.onboarding
  | `${typeof mobileRoutes.onboarding}?invite=${string}`
  | typeof mobileRoutes.home
  | typeof mobileRoutes.familiesSelect;

export function resolvePostLoginRoute(familyCount: number, inviteCode?: string | null): PostLoginRoute {
  if (familyCount < 0) {
    throw new Error('familyCount must be non-negative');
  }

  const code = inviteCode?.trim();
  if (code) {
    return `${mobileRoutes.onboarding}?invite=${code.toUpperCase()}`;
  }

  if (familyCount === 0) return mobileRoutes.onboarding;
  if (familyCount === 1) return mobileRoutes.home;
  return mobileRoutes.familiesSelect;
}

export type HomeRedirectRoute = PostLoginRoute | typeof mobileRoutes.login;

export function getHomeRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean,
  familyCount: number | undefined
): HomeRedirectRoute | null {
  if (isSessionLoading) return null;
  if (!isAuthenticated) return mobileRoutes.login;
  if (familyCount === undefined) return null;
  return resolvePostLoginRoute(familyCount);
}

export function getAuthGuardRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean
): typeof mobileRoutes.login | null {
  if (isSessionLoading) return null;
  return isAuthenticated ? null : mobileRoutes.login;
}

export function getGuestGuardRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean,
  familyCount: number | undefined,
  inviteCode?: string | null
): PostLoginRoute | null {
  if (isSessionLoading || !isAuthenticated || familyCount === undefined) return null;
  if (inviteCode?.trim()) return null;
  return resolvePostLoginRoute(familyCount);
}

export function getFamilySelectRedirect(
  familyCount: number | undefined,
  familyId: string | null
): typeof mobileRoutes.familiesSelect | null {
  if (familyCount !== undefined && familyCount > 1 && familyId === null) {
    return mobileRoutes.familiesSelect;
  }
  return null;
}
