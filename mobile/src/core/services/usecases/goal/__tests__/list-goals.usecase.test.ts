import type { GoalListResponse } from '@/core/domain/goal';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { ListGoalsUseCase } from '../list-goals.usecase';

describe('ListGoalsUseCase', () => {
  it('loads goals via GET /goals', async () => {
    const goals: GoalListResponse = {
      items: [
        {
          id: 'goal-1',
          title: 'Reserva emergência',
          targetAmount: 500,
          currentAmount: 100,
          status: 'Active',
          createdAt: '2026-06-18T12:00:00.000Z',
          createdBy: 'user-1',
        },
      ],
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: goals });
    const httpClient: IHttpClient = { request };

    const useCase = new ListGoalsUseCase(httpClient);
    const result = await useCase.listGoals();

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/goals',
    });
    expect(result).toEqual(goals);
  });
});
