import type { GoogleAuthResponse } from '@/core/domain/auth';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { AuthGetSessionUseCase } from '../get-session.usecase';

describe('AuthGetSessionUseCase', () => {
  it('fetches session from /auth/me', async () => {
    const session: GoogleAuthResponse = {
      user: { id: '1', email: 'a@b.com', name: 'Ana' },
      families: [{ id: 'f1', name: 'Família', role: 'Admin' }],
      isNewUser: false,
      familyCount: 1,
      accessToken: 'jwt',
    };

    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: session });
    const httpClient: IHttpClient = { request };

    const useCase = new AuthGetSessionUseCase(httpClient);
    const result = await useCase.getSession();

    expect(request).toHaveBeenCalledWith({
      method: 'get',
      url: '/auth/me',
      skipFamilyHeader: true,
    });
    expect(result).toEqual(session);
  });
});
