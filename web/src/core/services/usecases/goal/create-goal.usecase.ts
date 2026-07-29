import type { CreateGoalRequest, CreateGoalResponse } from '@/core/domain/goal';
import type { IGoal } from '@/core/domain/goal/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class CreateGoalUseCase implements Pick<IGoal, 'createGoal'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async createGoal(params: CreateGoalRequest): Promise<CreateGoalResponse> {
    const response = await this.httpClient.request<CreateGoalResponse>({
      method: 'post',
      url: '/goals',
      body: params,
    });

    return response.data;
  }
}
