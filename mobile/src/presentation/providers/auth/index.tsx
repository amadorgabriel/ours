import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { AuthSessionModel } from '@/core/domain/auth';

import type { AuthContextValue } from './index.types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSessionModel | null>(null);
  const [isSessionLoading, setIsSessionLoadingState] = useState(true);

  const setSession = useCallback((value: AuthSessionModel | null) => {
    setSessionState(value);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  const setIsSessionLoading = useCallback((loading: boolean) => {
    setIsSessionLoadingState(loading);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isSessionLoading,
      setSession,
      clearSession,
      setIsSessionLoading,
    }),
    [session, isSessionLoading, setSession, clearSession, setIsSessionLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
