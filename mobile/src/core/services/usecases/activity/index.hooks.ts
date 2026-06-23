import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { RegisterCallRequest, RegisterVisitRequest, UpdateActivityRequest } from '@/core/domain/activity';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useAssistido } from '@/presentation/providers/assistido';
import { useFamily } from '@/presentation/providers/family';

import { DeleteActivityUseCase } from './delete-activity.usecase';
import { ListActivityFeedUseCase } from './list-activity-feed.usecase';
import { MarkActivitySeenUseCase } from './mark-activity-seen.usecase';
import { getMonthRange } from './month-range';
import { RegisterCallUseCase } from './register-call.usecase';
import { RegisterVisitUseCase } from './register-visit.usecase';
import { UpdateActivityUseCase } from './update-activity.usecase';

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

export function useActivityUnreadCount() {
  const { data } = useActivityFeed();
  return data?.unreadCount ?? 0;
}

export function getActivitiesByMonthQueryOptions(
  familyId: string | null | undefined,
  parentId: string | null | undefined,
  year: number,
  month: number
) {
  const httpClient = HttpClientFactory.create();
  const useCase = new ListActivityFeedUseCase(httpClient);
  const range = getMonthRange(year, month);

  return {
    queryKey: queryKeys.activities.byMonth(familyId, year, month, parentId),
    queryFn: () =>
      useCase.listFeed({
        limit: 100,
        from: range.from,
        to: range.to,
        parentId: parentId ?? undefined,
      }),
    enabled: Boolean(familyId),
  };
}

export function useActivitiesByMonth(year: number, month: number) {
  const { familyId } = useFamily();
  const { parentId } = useAssistido();

  return useQuery(getActivitiesByMonthQueryOptions(familyId, parentId, year, month));
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

export function useRegisterVisit() {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new RegisterVisitUseCase(httpClient);

  return useMutation({
    mutationFn: (data: RegisterVisitRequest) => useCase.registerVisit(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useMarkActivitySeen() {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new MarkActivitySeenUseCase(httpClient);

  return useMutation({
    mutationFn: (activityId: string) => useCase.markSeen(activityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new UpdateActivityUseCase(httpClient);

  return useMutation({
    mutationFn: ({
      activityId,
      data,
    }: {
      activityId: string;
      data: UpdateActivityRequest;
    }) => useCase.updateActivity(activityId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new DeleteActivityUseCase(httpClient);

  return useMutation({
    mutationFn: (activityId: string) => useCase.deleteActivity(activityId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    },
  });
}
