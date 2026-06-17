import type { GoogleAuthResponse } from '@/core/domain/auth';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class AuthGetSessionUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async getSession(): Promise<GoogleAuthResponse> {
    const response = await this.httpClient.request<GoogleAuthResponse>({
      method: 'get',
      url: '/auth/me',
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
