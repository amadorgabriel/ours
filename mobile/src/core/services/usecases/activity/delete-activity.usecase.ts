import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class DeleteActivityUseCase implements Pick<IActivity, 'deleteActivity'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async deleteActivity(activityId: string): Promise<void> {
    await this.httpClient.request<void>({
      method: 'delete',
      url: `/activities/${activityId}`,
    });
  }
}
