export type PostLoginRoute = '/onboarding' | '/dashboard' | '/families/select';

export function resolvePostLoginRoute(familyCount: number): PostLoginRoute {
  if (familyCount <= 0) return '/onboarding';
  if (familyCount === 1) return '/dashboard';
  return '/families/select';
}
