'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import type { GoogleAuthRequest } from '@/core/domain/auth';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { setCachedAntiforgeryToken } from '@/core/infra/http/antiforgery-store';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useAuth } from '@/presentation/providers/auth';

import { AuthGetAntiforgeryUseCase } from './get-antiforgery.usecase';
import { AuthLoginGoogleUseCase } from './login-google.usecase';

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

export function useLoginWithGoogle() {
  const { setSession } = useAuth();
  const httpClient = HttpClientFactory.create();
  const useCase = new AuthLoginGoogleUseCase(httpClient);

  return useMutation({
    mutationFn: (data: GoogleAuthRequest) => useCase.loginWithGoogle(data),
    onSuccess: (session) => {
      setSession(session);
    },
  });
}
