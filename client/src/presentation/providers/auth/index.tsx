'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { AuthSessionModel } from '@/core/domain/auth';

import type { AuthContextValue } from './index.types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSessionModel | null>(null);

  const setSession = useCallback((value: AuthSessionModel | null) => {
    setSessionState(value);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      setSession,
      clearSession,
    }),
    [session, setSession, clearSession]
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
