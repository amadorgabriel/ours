import type { ActivityFeedParams, ActivityFeedResponse } from '@/core/domain/activity';
import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListActivityFeedUseCase implements Pick<IActivity, 'listFeed'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listFeed(params: ActivityFeedParams = {}): Promise<ActivityFeedResponse> {
    const { limit = 50, from, to, parentId } = params;
    const queryParams: Record<string, string | number> = { limit };

    if (from) queryParams.from = from;
    if (to) queryParams.to = to;
    if (parentId) queryParams.parentId = parentId;

    const response = await this.httpClient.request<ActivityFeedResponse>({
      method: 'get',
      url: '/activities/feed',
      queryParams,
    });

    return response.data;
  }
}
