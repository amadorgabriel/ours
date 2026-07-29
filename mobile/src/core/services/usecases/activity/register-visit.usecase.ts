import type { RegisterVisitRequest, RegisterVisitResponse } from '@/core/domain/activity';
import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class RegisterVisitUseCase implements Pick<IActivity, 'registerVisit'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async registerVisit(params: RegisterVisitRequest): Promise<RegisterVisitResponse> {
    const response = await this.httpClient.request<RegisterVisitResponse, RegisterVisitRequest>({
      method: 'post',
      url: '/activities/visit',
      body: params,
    });

    return response.data;
  }
}
