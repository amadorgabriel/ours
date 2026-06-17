import type { GoogleAuthResponse } from '@/core/domain/auth';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { AuthLoginGoogleUseCase } from '../login-google.usecase';

jest.mock('@/core/infra/storage/auth-storage', () => ({
  setStoredAuthToken: jest.fn(),
}));

import { setStoredAuthToken } from '@/core/infra/storage/auth-storage';

describe('AuthLoginGoogleUseCase', () => {
  it('persists accessToken from login response', async () => {
    const httpClient: IHttpClient = {
      request: jest.fn().mockResolvedValue({
        statusCode: 200,
        data: {
          user: { id: '1', email: 'a@b.com', name: 'A' },
          families: [],
          isNewUser: true,
          familyCount: 0,
          accessToken: 'jwt-123',
        } satisfies GoogleAuthResponse,
      }),
    };

    const useCase = new AuthLoginGoogleUseCase(httpClient);
    const session = await useCase.loginWithGoogle({ idToken: 'google-id' });

    expect(session.familyCount).toBe(0);
    expect(setStoredAuthToken).toHaveBeenCalledWith('jwt-123');
  });
});
