import { describe, expect, it } from 'vitest';

import { HttpClientMock } from '@/core/infra/http/http-client-mock';

import { AuthGetAntiforgeryUseCase } from './get-antiforgery.usecase';

describe('AuthGetAntiforgeryUseCase', () => {
  it('WHEN API returns token THEN SHALL map antiforgery response', async () => {
    const mock = new HttpClientMock();
    mock.setMockResponse('/auth/antiforgery', 'get', {
      statusCode: 200,
      data: { requestToken: 'csrf-token' },
    });

    const useCase = new AuthGetAntiforgeryUseCase(mock);
    const result = await useCase.getAntiforgeryToken();

    expect(result.requestToken).toBe('csrf-token');
    expect(mock.requests[0]?.skipAntiforgery).toBe(true);
  });
});
