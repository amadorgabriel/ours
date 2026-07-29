import type { UpdateGoalContributionRequest } from '@/core/domain/goal';
import type { CreateGoalContributionResponse } from '@/core/domain/goal';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class UpdateGoalContributionUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async updateGoalContribution(
    goalId: string,
    contributionId: string,
    data: UpdateGoalContributionRequest
  ): Promise<CreateGoalContributionResponse> {
    const response = await this.httpClient.request<
      CreateGoalContributionResponse,
      UpdateGoalContributionRequest
    >({
      method: 'patch',
      url: `/goals/${goalId}/contributions/${contributionId}`,
      body: data,
    });

    return response.data;
  }
}
