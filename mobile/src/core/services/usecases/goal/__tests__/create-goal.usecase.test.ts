import type { Goal } from '@/core/domain/goal';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { CreateGoalUseCase } from '../create-goal.usecase';

describe('CreateGoalUseCase', () => {
  it('creates goal via POST /goals', async () => {
    const goal: Goal = {
      id: 'goal-1',
      title: 'Fundo saúde',
      targetAmount: 250,
      currentAmount: 0,
      status: 'Active',
      createdAt: '2026-06-18T12:00:00.000Z',
      createdBy: 'user-1',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: goal });
    const httpClient: IHttpClient = { request };

    const useCase = new CreateGoalUseCase(httpClient);
    const result = await useCase.createGoal({ title: 'Fundo saúde', targetAmount: 250 });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/goals',
      body: { title: 'Fundo saúde', targetAmount: 250 },
    });
    expect(result).toEqual(goal);
  });
});
