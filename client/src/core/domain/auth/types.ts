export type AuthUserId = string;

export interface UserFamily {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
  families: UserFamily[];
}

export interface AuthResponse {
  user: AuthUser;
  isNewUser: boolean;
  familyCount: number;
}

export type PostLoginRoute = '/dashboard';

/**
 * Sempre redireciona para /dashboard
 * O estado do usuário (onboarding/family picker) é tratado na própria página do dashboard
 */
export function resolvePostLoginRoute(): PostLoginRoute {
  return '/dashboard';
}
