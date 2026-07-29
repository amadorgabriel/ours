import type { IHttpClient } from '@/core/infra/http/index.types';

import { DeleteGoalContributionUseCase } from '../delete-goal-contribution.usecase';

describe('DeleteGoalContributionUseCase', () => {
  it('deletes contribution via DELETE /goals/{goalId}/contributions/{id}', async () => {
    const request = jest.fn().mockResolvedValue({ statusCode: 204, data: undefined });
    const httpClient: IHttpClient = { request };
    const useCase = new DeleteGoalContributionUseCase(httpClient);

    await useCase.deleteGoalContribution('goal-1', 'contrib-1');

    expect(request).toHaveBeenCalledWith({
      method: 'delete',
      url: '/goals/goal-1/contributions/contrib-1',
    });
  });
});
