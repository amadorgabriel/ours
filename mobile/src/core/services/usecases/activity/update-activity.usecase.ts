import type { UpdateActivityRequest, UpdateActivityResponse } from '@/core/domain/activity';
import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class UpdateActivityUseCase implements Pick<IActivity, 'updateActivity'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async updateActivity(
    activityId: string,
    params: UpdateActivityRequest
  ): Promise<UpdateActivityResponse> {
    const response = await this.httpClient.request<
      UpdateActivityResponse,
      UpdateActivityRequest
    >({
      method: 'patch',
      url: `/activities/${activityId}`,
      body: params,
    });

    return response.data;
  }
}
