'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GoogleAuthRequest } from '@/core/domain/auth';
import { setCachedAntiforgeryToken } from '@/core/infra/http/antiforgery-store';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { HttpClientError } from '@/core/infra/http/http-error';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';

import { applyActiveFamilyFromSession } from './apply-active-family';
import { AuthGetAntiforgeryUseCase } from './get-antiforgery.usecase';
import { AuthGetSessionUseCase } from './get-session.usecase';
import { AuthLoginGoogleUseCase } from './login-google.usecase';
import { AuthLogoutUseCase } from './logout.usecase';

export function useAntiforgeryToken(enabled = false) {
  const httpClient = HttpClientFactory.create();
  const useCase = new AuthGetAntiforgeryUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.auth.antiforgery(),
    queryFn: async () => {
      const result = await useCase.getAntiforgeryToken();
      setCachedAntiforgeryToken(result.requestToken);
      return result;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSession(enabled = true) {
  const { setSession, clearSession } = useAuth();
  const httpClient = HttpClientFactory.create();
  const useCase = new AuthGetSessionUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async () => {
      try {
        const session = await useCase.getSession();
        setSession(session);
        return session;
      } catch (error) {
        if (error instanceof HttpClientError && error.statusCode === 401) {
          clearSession();
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
    onSuccess: (session) => {
      setSession(session);
      applyActiveFamilyFromSession(session, setFamilyId);
      queryClient.setQueryData(queryKeys.auth.session(), session);
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
    mutationFn: () => useCase.logout(),
    onSuccess: () => {
      clearSession();
      setFamilyId(null);
      setCachedAntiforgeryToken(null);
      queryClient.clear();

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  });
}
