import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateGoalRequest } from '@/core/domain/goal';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useFamily } from '@/presentation/providers/family';

import { CreateGoalUseCase } from './create-goal.usecase';
import { ListGoalsUseCase } from './list-goals.usecase';

export function useGoals() {
  const { familyId } = useFamily();
  const httpClient = HttpClientFactory.create();
  const useCase = new ListGoalsUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.goals.list(familyId),
    queryFn: () => useCase.listGoals(),
    enabled: Boolean(familyId),
  });
}

export function useCreateGoal() {
  const { familyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new CreateGoalUseCase(httpClient);

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => useCase.createGoal(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
    meta: { familyId },
  });
}
