import type { AntiforgeryResponse } from '@/core/domain/auth';
import type { IAuth } from '@/core/domain/auth/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class AuthGetAntiforgeryUseCase implements Pick<IAuth, 'getAntiforgeryToken'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async getAntiforgeryToken(): Promise<AntiforgeryResponse> {
    const response = await this.httpClient.request<AntiforgeryResponse>({
      method: 'get',
      url: '/auth/antiforgery',
      skipAntiforgery: true,
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
