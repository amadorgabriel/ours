import type { JoinFamilyRequest, JoinFamilyResponse } from '@/core/domain/family';
import type { IFamily } from '@/core/domain/family/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class JoinFamilyUseCase implements Pick<IFamily, 'join'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async join(params: JoinFamilyRequest): Promise<JoinFamilyResponse> {
    const response = await this.httpClient.request<JoinFamilyResponse, JoinFamilyRequest>({
      method: 'post',
      url: '/join',
      body: { inviteCode: params.inviteCode.trim().toUpperCase() },
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
