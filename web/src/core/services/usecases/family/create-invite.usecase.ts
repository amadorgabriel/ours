import type { CreateInviteRequest, CreateInviteResponse } from '@/core/domain/family';
import type { IFamily } from '@/core/domain/family/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class CreateInviteUseCase implements Pick<IFamily, 'createInvite'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async createInvite(params: CreateInviteRequest): Promise<CreateInviteResponse> {
    const response = await this.httpClient.request<CreateInviteResponse, CreateInviteRequest>({
      method: 'post',
      url: '/invite',
      body: params,
    });

    return response.data;
  }
}
