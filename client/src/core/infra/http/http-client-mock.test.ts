import { describe, expect, it } from 'vitest';

import { HttpClientMock } from './http-client-mock';

describe('HttpClientMock', () => {
  it('WHEN mock is configured THEN SHALL return configured response', async () => {
    const mock = new HttpClientMock();
    mock.delayMs = 0;
    mock.setMockResponse('/auth/antiforgery', 'get', {
      statusCode: 200,
      data: { requestToken: 'token-1' },
    });

    const response = await mock.request({
      method: 'get',
      url: '/auth/antiforgery',
    });

    expect(response.data).toEqual({ requestToken: 'token-1' });
    expect(mock.requests).toHaveLength(1);
  });
});
