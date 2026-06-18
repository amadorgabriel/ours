import type { ActivityFeedResponse } from '@/core/domain/activity';
import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListActivityFeedUseCase implements Pick<IActivity, 'listFeed'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listFeed(limit = 50): Promise<ActivityFeedResponse> {
    const response = await this.httpClient.request<ActivityFeedResponse>({
      method: 'get',
      url: '/activities/feed',
      queryParams: { limit },
    });

    return response.data;
  }
}
