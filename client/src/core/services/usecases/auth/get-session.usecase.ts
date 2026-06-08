import type { GoogleAuthResponse } from '@/core/domain/auth';
import type { IAuth } from '@/core/domain/auth/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class AuthGetSessionUseCase implements Pick<IAuth, 'getSession'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async getSession(): Promise<GoogleAuthResponse> {
    const response = await this.httpClient.request<GoogleAuthResponse>({
      method: 'get',
      url: '/auth/me',
      skipAntiforgery: true,
      skipFamilyHeader: true,
      skipUnauthorizedRedirect: true,
    });

    return response.data;
  }
}
