import type { IHttpClient } from '@/core/infra/http/index.types';

import { AuthLogoutUseCase } from '../logout.usecase';

jest.mock('@/core/infra/storage/auth-storage', () => ({
  clearStoredAuthToken: jest.fn(),
}));

import { clearStoredAuthToken } from '@/core/infra/storage/auth-storage';

describe('AuthLogoutUseCase', () => {
  it('calls logout endpoint and clears stored token', async () => {
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: null });
    const httpClient: IHttpClient = { request };

    const useCase = new AuthLogoutUseCase(httpClient);
    await useCase.logout();

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/auth/logout',
      skipFamilyHeader: true,
    });
    expect(clearStoredAuthToken).toHaveBeenCalled();
  });
});
