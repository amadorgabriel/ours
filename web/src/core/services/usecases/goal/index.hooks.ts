'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateGoalContributionRequest, CreateGoalRequest } from '@/core/domain/goal';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';
import { queryKeys } from '@/core/infra/query/query-keys';
import { useFamily } from '@/presentation/providers/family';

import { CreateGoalContributionUseCase } from './create-goal-contribution.usecase';
import { CreateGoalUseCase } from './create-goal.usecase';
import { ListGoalContributionsUseCase } from './list-goal-contributions.usecase';
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
