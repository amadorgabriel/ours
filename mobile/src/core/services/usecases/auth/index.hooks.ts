import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import type { GoogleAuthRequest } from '@/core/domain/auth';
import { registerAuthTokenGetter, unregisterAuthTokenGetter } from '@/core/infra/http/auth-token-context';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { HttpClientError } from '@/core/infra/http/http-error';
import { queryKeys } from '@/core/infra/query/query-keys';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from '@/core/infra/storage/auth-storage';
import { getInMemoryAuthToken, setInMemoryAuthToken } from '@/core/infra/storage/auth-token-memory';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';

import { applyActiveFamilyFromSession } from './apply-active-family';
import { AuthGetSessionUseCase } from './get-session.usecase';
import { AuthLoginGoogleUseCase } from './login-google.usecase';
import { AuthLogoutUseCase } from './logout.usecase';
import { prefetchParentsForFamily } from '../parent/prefetch-parents';

export async function hydrateAuthTokenFromStorage(): Promise<string | null> {
  const token = await getStoredAuthToken();
  setInMemoryAuthToken(token);
  return token;
}

export function registerAuthTokenFromMemory(): void {
  registerAuthTokenGetter(() => getInMemoryAuthToken());
}

export function unregisterAuthTokenFromMemory(): void {
  unregisterAuthTokenGetter();
}

export function useSession(enabled = true) {
  const { setSession, clearSession } = useAuth();
  const { setFamilyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new AuthGetSessionUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      try {
        const session = await useCase.getSession();
        setSession(session);
        applyActiveFamilyFromSession(session, setFamilyId);

        if (session.familyCount === 1 && session.families[0]) {
          await prefetchParentsForFamily(queryClient, session.families[0].id);
        }

        return session;
      } catch (error) {
        if (error instanceof HttpClientError && error.statusCode === 401) {
          setInMemoryAuthToken(null);
          await clearStoredAuthToken();
          clearSession();
          setFamilyId(null);
          return null;
        }
        throw error;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLoginWithGoogle() {
  const { setSession } = useAuth();
  const { setFamilyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new AuthLoginGoogleUseCase(httpClient);

  return useMutation({
    mutationFn: (data: GoogleAuthRequest) => useCase.loginWithGoogle(data),
    onSuccess: async (session) => {
      if (session.accessToken) {
        setInMemoryAuthToken(session.accessToken);
        await setStoredAuthToken(session.accessToken);
      }
      setSession(session);
      applyActiveFamilyFromSession(session, setFamilyId);
      queryClient.setQueryData(queryKeys.auth.session(), session);

      if (session.familyCount === 1 && session.families[0]) {
        await prefetchParentsForFamily(queryClient, session.families[0].id);
      }
    },
  });
}

export function useLogout() {
  const { clearSession } = useAuth();
  const { setFamilyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new AuthLogoutUseCase(httpClient);

  return useMutation({
    mutationFn: async () => {
      try {
        await useCase.logout();
      } catch {
        // Server logout is best-effort; local session must still clear.
      }
    },
    onSettled: async () => {
      try {
        await GoogleSignin.signOut();
      } catch {
        // User may not have signed in with Google on this device.
      }
      setInMemoryAuthToken(null);
      await clearStoredAuthToken();
      clearSession();
      setFamilyId(null);
      queryClient.clear();
    },
  });
}
