import { resolvePostLoginRoute, type PostLoginRoute } from '@/core/services/usecases/auth/resolve-post-login-route';
import { routes } from '@/i18n/routes';

export type HomeRedirectRoute = PostLoginRoute | typeof routes.login;

export function getHomeRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean,
  familyCount: number | undefined
): HomeRedirectRoute | null {
  if (isSessionLoading) return null;
  if (!isAuthenticated) return routes.login;
  if (familyCount === undefined) return null;
  return resolvePostLoginRoute(familyCount);
}

export function getAuthGuardRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean
): typeof routes.login | null {
  if (isSessionLoading) return null;
  return isAuthenticated ? null : routes.login;
}

export function getGuestGuardRedirect(
  isSessionLoading: boolean,
  isAuthenticated: boolean,
  familyCount: number | undefined
): PostLoginRoute | null {
  if (isSessionLoading || !isAuthenticated || familyCount === undefined) return null;
  return resolvePostLoginRoute(familyCount);
}
