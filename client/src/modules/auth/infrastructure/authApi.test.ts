import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAntiforgeryToken, postGoogleLogin } from './authApi';

describe('authApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchAntiforgeryToken reads requestToken from JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Promise.resolve(
          new Response(JSON.stringify({ requestToken: 'abc' }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
        ),
      ),
    );

    const token = await fetchAntiforgeryToken();
    expect(token).toBe('abc');
    expect(fetch).toHaveBeenCalledWith('/api/auth/antiforgery', { credentials: 'include', method: 'GET' });
  });

  it('postGoogleLogin sends JSON body and antiforgery header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.resolve(new Response('', { status: 200 }))),
    );

    await postGoogleLogin('id-token-value', 'vf-token');

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/google',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          RequestVerificationToken: 'vf-token',
        }),
        body: JSON.stringify({ idToken: 'id-token-value' }),
      }),
    );
  });
});
