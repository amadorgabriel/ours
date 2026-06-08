import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { mockSession } from './index.mock';
import { AuthGetSessionUseCase } from './get-session.usecase';

describe('AuthGetSessionUseCase', () => {
  it('WHEN API returns session THEN SHALL map auth session response', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/auth/me', 'get', {
      statusCode: 200,
      data: mockSession,
    });

    const useCase = new AuthGetSessionUseCase(mock);
    const result = await useCase.getSession();

    expect(result).toEqual(mockSession);
    expect(mock.requests[0]?.skipAntiforgery).toBe(true);
    expect(mock.requests[0]?.skipFamilyHeader).toBe(true);
    expect(mock.requests[0]?.skipUnauthorizedRedirect).toBe(true);
  });

  it('WHEN API returns 401 THEN SHALL throw HttpClientError', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/auth/me', 'get', {
      statusCode: 401,
      data: {},
    });

    const useCase = new AuthGetSessionUseCase(mock);

    await expect(useCase.getSession()).rejects.toMatchObject({ statusCode: 401 });
  });
});
