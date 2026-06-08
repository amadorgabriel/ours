import type { IAuth } from '@/core/domain/auth/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class AuthLogoutUseCase implements Pick<IAuth, 'logout'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async logout(): Promise<void> {
    await this.httpClient.request({
      method: 'post',
      url: '/auth/logout',
      skipFamilyHeader: true,
      skipUnauthorizedRedirect: true,
    });
  }
}
