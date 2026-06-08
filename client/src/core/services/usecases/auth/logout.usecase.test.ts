import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { AuthLogoutUseCase } from './logout.usecase';

describe('AuthLogoutUseCase', () => {
  it('WHEN API accepts logout THEN SHALL POST /auth/logout', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/auth/logout', 'post', {
      statusCode: 200,
      data: {},
    });

    const useCase = new AuthLogoutUseCase(mock);
    await useCase.logout();

    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.method).toBe('post');
    expect(mock.requests[0]?.url).toBe('/auth/logout');
    expect(mock.requests[0]?.skipFamilyHeader).toBe(true);
    expect(mock.requests[0]?.skipUnauthorizedRedirect).toBe(true);
  });
});
