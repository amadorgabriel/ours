import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateGoalRequest, CreateGoalContributionRequest, UpdateGoalContributionRequest } from '@/core/domain/goal';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useFamily } from '@/presentation/providers/family';

import { CreateGoalContributionUseCase } from './create-goal-contribution.usecase';
import { CreateGoalUseCase } from './create-goal.usecase';
import { ListGoalContributionsUseCase } from './list-goal-contributions.usecase';
import { ListGoalsUseCase } from './list-goals.usecase';
import { UpdateGoalContributionUseCase } from './update-goal-contribution.usecase';
import { DeleteGoalContributionUseCase } from './delete-goal-contribution.usecase';

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

export function useGoalContributions(goalId: string | null) {
  const { familyId } = useFamily();
  const httpClient = HttpClientFactory.create();
  const useCase = new ListGoalContributionsUseCase(httpClient);

  return useQuery({
    queryKey: queryKeys.goals.contributions(familyId, goalId ?? 'none'),
    queryFn: () => useCase.listGoalContributions(goalId!),
    enabled: Boolean(familyId && goalId),
  });
}

export function useCreateGoalContribution(goalId: string) {
  const { familyId } = useFamily();
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new CreateGoalContributionUseCase(httpClient);

  return useMutation({
    mutationFn: (data: CreateGoalContributionRequest) =>
      useCase.createGoalContribution(goalId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
    meta: { familyId, goalId },
  });
}

export function useUpdateGoalContribution(goalId: string) {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new UpdateGoalContributionUseCase(httpClient);

  return useMutation({
    mutationFn: ({
      contributionId,
      data,
    }: {
      contributionId: string;
      data: UpdateGoalContributionRequest;
    }) => useCase.updateGoalContribution(goalId, contributionId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}

export function useDeleteGoalContribution(goalId: string) {
  const queryClient = useQueryClient();
  const httpClient = HttpClientFactory.create();
  const useCase = new DeleteGoalContributionUseCase(httpClient);

  return useMutation({
    mutationFn: (contributionId: string) => useCase.deleteGoalContribution(goalId, contributionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}
