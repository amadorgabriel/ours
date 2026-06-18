import type { ActivityFeedResponse } from '@/core/domain/activity';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { ListActivityFeedUseCase } from '../list-activity-feed.usecase';

describe('ListActivityFeedUseCase', () => {
  it('loads feed via GET /activities/feed', async () => {
    const feed: ActivityFeedResponse = {
      items: [
        {
          id: 'act-1',
          type: 'Call',
          createdAt: '2026-06-18T12:00:00.000Z',
          userId: 'user-1',
          userName: 'Ana',
          notes: 'Tudo bem',
        },
      ],
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: feed });
    const httpClient: IHttpClient = { request };

    const useCase = new ListActivityFeedUseCase(httpClient);
    const result = await useCase.listFeed(50);

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/activities/feed',
      queryParams: { limit: 50 },
    });
    expect(result).toEqual(feed);
  });
});
