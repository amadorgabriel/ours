import type { IHttpClient } from '@/core/infra/http/index.types';

import { DeleteGoalUseCase } from '../delete-goal.usecase';

describe('DeleteGoalUseCase', () => {
  it('deletes goal via DELETE /goals/{id}', async () => {
    const request = jest.fn().mockResolvedValue({ statusCode: 204, data: undefined });
    const httpClient: IHttpClient = { request };
    const useCase = new DeleteGoalUseCase(httpClient);

    await useCase.deleteGoal('goal-1');

    expect(request).toHaveBeenCalledWith({
      method: 'delete',
      url: '/goals/goal-1',
    });
  });
});
