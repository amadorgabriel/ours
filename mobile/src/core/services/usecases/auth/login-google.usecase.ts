import type { GoogleAuthRequest, GoogleAuthResponse } from '@/core/domain/auth';
import type { IHttpClient } from '@/core/infra/http/index.types';
import { setStoredAuthToken } from '@/core/infra/storage/auth-storage';

export class AuthLoginGoogleUseCase {
  constructor(private readonly httpClient: IHttpClient) {}

  async loginWithGoogle(params: GoogleAuthRequest): Promise<GoogleAuthResponse> {
    const response = await this.httpClient.request<GoogleAuthResponse, GoogleAuthRequest>({
      method: 'post',
      url: '/auth/google',
      body: params,
      skipFamilyHeader: true,
      skipAuthHeader: true,
    });

    const session = response.data;
    if (session.accessToken) {
      await setStoredAuthToken(session.accessToken);
    }

    return session;
  }
}
