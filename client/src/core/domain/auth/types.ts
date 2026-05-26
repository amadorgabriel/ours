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

export type PostLoginRoute = '/onboarding' | '/dashboard' | '/families/select';

/**
 * Determina a rota de destino após login baseado no estado do usuário
 */
export function resolvePostLoginRoute(response: AuthResponse): PostLoginRoute {
  // Novo usuário ou sem família → onboarding
  if (response.isNewUser || response.familyCount === 0) {
    return '/onboarding';
  }

  // Uma família → dashboard direto
  if (response.familyCount === 1) {
    return '/dashboard';
  }

  // Múltiplas famílias → seletor
  return '/families/select';
}
