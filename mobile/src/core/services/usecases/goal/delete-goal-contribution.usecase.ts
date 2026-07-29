import type { IHttpClient } from '@/core/infra/http/index.types';

export class DeleteGoalContributionUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async deleteGoalContribution(goalId: string, contributionId: string): Promise<void> {
    await this.httpClient.request<void>({
      method: 'delete',
      url: `/goals/${goalId}/contributions/${contributionId}`,
    });
  }
}
