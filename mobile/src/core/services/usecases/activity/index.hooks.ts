import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { RegisterCallRequest } from '@/core/domain/activity';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useAssistido } from '@/presentation/providers/assistido';
import { useFamily } from '@/presentation/providers/family';

import { ListActivityFeedUseCase } from './list-activity-feed.usecase';
import { getMonthRange } from './month-range';
import { RegisterCallUseCase } from './register-call.usecase';

export function useActivityFeed(limit = 50) {
  const { familyId } = useFamily();
  const { parentId } = useAssistido();
  const httpClient = HttpClientFactory.create();
  const useCase = new ListActivityFeedUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.activities.feed(familyId, parentId),
    queryFn: () => useCase.listFeed({ limit, parentId: parentId ?? undefined }),
    enabled: Boolean(familyId),
  });
}

export function useActivitiesByMonth(year: number, month: number) {
  const { familyId } = useFamily();
  const { parentId } = useAssistido();
  const httpClient = HttpClientFactory.create();
  const useCase = new ListActivityFeedUseCase(httpClient);
  const range = getMonthRange(year, month);

  return useQuery({
    queryKey: queryKeys.activities.byMonth(familyId, year, month, parentId),
    queryFn: () =>
      useCase.listFeed({
        limit: 100,
        from: range.from,
        to: range.to,
        parentId: parentId ?? undefined,
      }),
    enabled: Boolean(familyId),
  });
}

export function useRegisterCall() {
  const { familyId } = useFamily();
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
