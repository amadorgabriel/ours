import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class MarkActivitySeenUseCase implements Pick<IActivity, 'markSeen'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async markSeen(activityId: string): Promise<void> {
    await this.httpClient.request<void>({
      method: 'post',
      url: `/activities/${activityId}/seen`,
    });
  }
}
