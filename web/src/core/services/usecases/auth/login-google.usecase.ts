import type { GoogleAuthRequest, GoogleAuthResponse } from '@/core/domain/auth';
import type { IAuth } from '@/core/domain/auth/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class AuthLoginGoogleUseCase implements Pick<IAuth, 'loginWithGoogle'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async loginWithGoogle(params: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    const response = await this.httpClient.request<GoogleAuthResponse, GoogleAuthRequest>({
      method: 'post',
      url: '/auth/google',
      body: params,
      skipFamilyHeader: true,
    });

    return response.data;
  }
}
