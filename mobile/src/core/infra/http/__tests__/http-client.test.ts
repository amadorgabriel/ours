import {
  registerAuthTokenGetter,
  unregisterAuthTokenGetter,
} from '../auth-token-context';
import {
  registerFamilyIdGetter,
  unregisterFamilyIdGetter,
} from '../family-context';
import { HttpClient, MOBILE_PLATFORM_HEADER, MOBILE_PLATFORM_VALUE } from '../http-client';

const mockRequest = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      request: (...args: unknown[]) => mockRequest(...args),
    })),
    isAxiosError: jest.fn(() => false),
  },
}));

describe('HttpClient', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({
      status: 200,
      data: { ok: true },
      headers: { toJSON: () => ({}) },
    });
    unregisterAuthTokenGetter();
    unregisterFamilyIdGetter();
  });

  it('sends mobile platform header on every request', async () => {
    const client = new HttpClient('https://api.test');

    await client.request({ method: 'get', url: '/auth/me' });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          [MOBILE_PLATFORM_HEADER]: MOBILE_PLATFORM_VALUE,
        }),
      })
    );
  });

  it('injects Bearer token when auth getter is registered', async () => {
    registerAuthTokenGetter(() => 'jwt-token');
    const client = new HttpClient('https://api.test');

    await client.request({ method: 'get', url: '/auth/me' });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token',
        }),
      })
    );
  });

  it('injects X-Family-Id when family getter is registered', async () => {
    registerFamilyIdGetter(() => 'family-1');
    const client = new HttpClient('https://api.test');

    await client.request({ method: 'get', url: '/families' });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Family-Id': 'family-1',
        }),
      })
    );
  });

  it('skips auth header when skipAuthHeader is true', async () => {
    registerAuthTokenGetter(() => 'jwt-token');
    const client = new HttpClient('https://api.test');

    await client.request({ method: 'post', url: '/auth/google', skipAuthHeader: true });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.anything(),
        }),
      })
    );
  });
});
