import type { GoalListResponse } from '@/core/domain/goal';
import type { IGoal } from '@/core/domain/goal/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class ListGoalsUseCase implements Pick<IGoal, 'listGoals'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async listGoals(parentId?: string | null): Promise<GoalListResponse> {
    const queryParams: Record<string, string> = {};
    if (parentId) {
      queryParams.parentId = parentId;
    }

    const response = await this.httpClient.request<GoalListResponse>({
      method: 'get',
      url: '/goals',
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    return response.data;
  }
}
