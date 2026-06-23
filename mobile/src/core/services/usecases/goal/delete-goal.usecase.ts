import type { IHttpClient } from '@/core/infra/http/index.types';

export class DeleteGoalUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async deleteGoal(goalId: string): Promise<void> {
    await this.httpClient.request<void>({
      method: 'delete',
      url: `/goals/${goalId}`,
    });
  }
}
