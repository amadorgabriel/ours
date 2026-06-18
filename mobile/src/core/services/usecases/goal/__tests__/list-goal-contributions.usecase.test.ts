import type { IHttpClient } from '@/core/infra/http/index.types';

import { ListGoalContributionsUseCase } from '../list-goal-contributions.usecase';

describe('ListGoalContributionsUseCase', () => {
  it('lists contributions via GET /goals/{id}/contributions', async () => {
    const response = {
      items: [
        {
          id: 'c1',
          amount: 50,
          isPrivate: false,
          userId: 'user-1',
          userName: 'Ana',
          createdAt: '2026-06-18T12:00:00.000Z',
        },
      ],
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: response });
    const httpClient: IHttpClient = { request };

    const useCase = new ListGoalContributionsUseCase(httpClient);
    const result = await useCase.listGoalContributions('goal-1');

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/goals/goal-1/contributions',
    });
    expect(result).toEqual(response);
  });
});
