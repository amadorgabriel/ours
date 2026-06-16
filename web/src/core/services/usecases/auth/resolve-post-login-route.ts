import { routes } from '@/i18n/routes';

export type PostLoginRoute =
  | typeof routes.onboarding
  | typeof routes.dashboard
  | typeof routes.families.select;

export function resolvePostLoginRoute(familyCount: number): PostLoginRoute {
  if (familyCount < 0) {
    throw new Error('familyCount must be non-negative');
  }
  if (familyCount === 0) return routes.onboarding;
  if (familyCount === 1) return routes.dashboard;
  return routes.families.select;
}
