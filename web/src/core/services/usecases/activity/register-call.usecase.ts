import type { RegisterCallRequest, RegisterCallResponse } from '@/core/domain/activity';
import type { IActivity } from '@/core/domain/activity/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class RegisterCallUseCase implements Pick<IActivity, 'registerCall'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async registerCall(params: RegisterCallRequest): Promise<RegisterCallResponse> {
    const response = await this.httpClient.request<RegisterCallResponse, RegisterCallRequest>({
      method: 'post',
      url: '/activities/call',
      body: params,
    });

    return response.data;
  }
}
