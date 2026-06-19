export const routes = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  onboarding: '/onboarding',
  goals: '/goals',
  parents: '/parents',
  feed: '/feed',
  families: {
    select: '/families/select',
    add: '/families/add',
  },
} as const;

export type AppRoute =
  | typeof routes.home
  | typeof routes.login
  | typeof routes.dashboard
  | typeof routes.onboarding
  | typeof routes.goals
  | typeof routes.parents
  | typeof routes.feed
  | typeof routes.families.select
  | typeof routes.families.add;

/** Rotas autenticadas que não usam sidebar completa */
export const minimalShellRoutes: readonly AppRoute[] = [routes.onboarding];

export function isMinimalShellRoute(pathname: string): boolean {
  return (minimalShellRoutes as readonly string[]).includes(pathname);
}
