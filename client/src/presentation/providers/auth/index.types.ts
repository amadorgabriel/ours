import type { AuthSessionModel } from '@/core/domain/auth';

export type AuthContextValue = {
  session: AuthSessionModel | null;
  isAuthenticated: boolean;
  isSessionLoading: boolean;
  setSession: (session: AuthSessionModel | null) => void;
  clearSession: () => void;
  setIsSessionLoading: (loading: boolean) => void;
};
