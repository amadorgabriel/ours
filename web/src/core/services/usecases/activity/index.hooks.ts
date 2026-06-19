'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { RegisterCallRequest } from '@/core/domain/activity';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useFamily } from '@/presentation/providers/family';

import { ListActivityFeedUseCase } from './list-activity-feed.usecase';
import { RegisterCallUseCase } from './register-call.usecase';

export function useActivityFeed(limit = 50) {
  const { familyId } = useFamily();
  const httpClient = HttpClientFactory.create();
  const useCase = new ListActivityFeedUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.activities.feed(familyId),
    queryFn: () => useCase.listFeed({ limit }),
    enabled: Boolean(familyId),
  });
}

export function useRegisterCall() {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new RegisterCallUseCase(httpClient);

  return useMutation({
    mutationFn: (data: RegisterCallRequest) => useCase.registerCall(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
