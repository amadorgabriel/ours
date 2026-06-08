import type { AuthSessionModel } from '@/core/domain/auth';

export type AuthContextValue = {
  session: AuthSessionModel | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSessionModel | null) => void;
  clearSession: () => void;
};
