import type {
  CreateGoalContributionRequest,
  CreateGoalContributionResponse,
} from '@/core/domain/goal';
import type { IGoal } from '@/core/domain/goal/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class CreateGoalContributionUseCase implements Pick<IGoal, 'createGoalContribution'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async createGoalContribution(
    goalId: string,
    params: CreateGoalContributionRequest
  ): Promise<CreateGoalContributionResponse> {
    const response = await this.httpClient.request<CreateGoalContributionResponse>({
      method: 'post',
      url: `/goals/${goalId}/contributions`,
      body: params,
    });

    return response.data;
  }
}
