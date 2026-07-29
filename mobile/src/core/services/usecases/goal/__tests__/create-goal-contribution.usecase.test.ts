import type { GoalContribution } from '@/core/domain/goal';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { CreateGoalContributionUseCase } from '../create-goal-contribution.usecase';

describe('CreateGoalContributionUseCase', () => {
  it('creates contribution via POST /goals/{id}/contributions', async () => {
    const contribution: GoalContribution = {
      id: 'c1',
      amount: 50,
      isPrivate: false,
      userId: 'user-1',
      userName: 'Ana',
      createdAt: '2026-06-18T12:00:00.000Z',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: contribution });
    const httpClient: IHttpClient = { request };

    const useCase = new CreateGoalContributionUseCase(httpClient);
    const result = await useCase.createGoalContribution('goal-1', {
      amount: 50,
      isPrivate: false,
    });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/goals/goal-1/contributions',
      body: { amount: 50, isPrivate: false },
    });
    expect(result).toEqual(contribution);
  });
});
