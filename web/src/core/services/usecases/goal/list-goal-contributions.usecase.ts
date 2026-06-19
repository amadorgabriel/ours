import type { GoalContributionListResponse } from '@/core/domain/goal';
import type { IGoal } from '@/core/domain/goal/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListGoalContributionsUseCase implements Pick<IGoal, 'listGoalContributions'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listGoalContributions(goalId: string): Promise<GoalContributionListResponse> {
    const response = await this.httpClient.request<GoalContributionListResponse>({
      method: 'get',
      url: `/goals/${goalId}/contributions`,
    });

    return response.data;
  }
}
