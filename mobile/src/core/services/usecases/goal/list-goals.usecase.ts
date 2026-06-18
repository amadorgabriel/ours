import type { GoalListResponse } from '@/core/domain/goal';
import type { IGoal } from '@/core/domain/goal/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListGoalsUseCase implements Pick<IGoal, 'listGoals'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listGoals(): Promise<GoalListResponse> {
    const response = await this.httpClient.request<GoalListResponse>({
      method: 'get',
      url: '/goals',
    });

    return response.data;
  }
}
