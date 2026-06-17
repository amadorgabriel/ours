import type { IHttpClient } from '@/core/infra/http/index.types';
import { clearStoredAuthToken } from '@/core/infra/storage/auth-storage';

export class AuthLogoutUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async logout(): Promise<void> {
    await this.httpClient.request({
      method: 'post',
      url: '/auth/logout',
      skipFamilyHeader: true,
    });
    await clearStoredAuthToken();
  }
}
