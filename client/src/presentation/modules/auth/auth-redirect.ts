import { resolvePostLoginRoute, type PostLoginRoute } from '@/core/services/usecases/auth/resolve-post-login-route';

export type HomeRedirectRoute = PostLoginRoute | '/login';

export function getHomeRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean,
  familyCount: number | undefined
): HomeRedirectRoute | null {
  if (isSessionLoading) return null;
  if (!isAuthenticated) return '/login';
  if (familyCount === undefined) return null;
  return resolvePostLoginRoute(familyCount);
}

export function getAuthGuardRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean
): '/login' | null {
  if (isSessionLoading) return null;
  return isAuthenticated ? null : '/login';
}

export function getGuestGuardRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean,
  familyCount: number | undefined
): PostLoginRoute | null {
  if (isSessionLoading || !isAuthenticated || familyCount === undefined) return null;
  return resolvePostLoginRoute(familyCount);
}
