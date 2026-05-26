import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAntiforgeryTokenFromApi, postGoogleLoginToApi } from './authGateway';

describe('authGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchAntiforgeryTokenFromApi', () => {
    it('returns requestToken from successful response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Promise.resolve(
            new Response(JSON.stringify({ requestToken: 'abc123' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          ),
        ),
      );

      const token = await fetchAntiforgeryTokenFromApi();
      expect(token).toBe('abc123');
      expect(fetch).toHaveBeenCalledWith('/api/auth/antiforgery', {
        credentials: 'include',
        method: 'GET',
      });
    });

    it('throws when response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Promise.resolve(new Response('Error', { status: 500 })),
        ),
      );

      await expect(fetchAntiforgeryTokenFromApi()).rejects.toThrow(
        'Antiforgery request failed: 500',
      );
    });

    it('throws when requestToken is missing', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Promise.resolve(
            new Response(JSON.stringify({}), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          ),
        ),
      );

      await expect(fetchAntiforgeryTokenFromApi()).rejects.toThrow(
        'Missing requestToken in antiforgery response',
      );
    });
  });

  describe('postGoogleLoginToApi', () => {
    it('returns parsed AuthResponse on success', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
          families: [],
        },
        isNewUser: true,
        familyCount: 0,
      };

      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Promise.resolve(
            new Response(JSON.stringify(mockResponse), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          ),
        ),
      );

      const result = await postGoogleLoginToApi('google-id-token', 'antiforgery-token');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/google',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: 'antiforgery-token',
          },
          body: JSON.stringify({ idToken: 'google-id-token' }),
        }),
      );
    });

    it('throws when response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Promise.resolve(new Response('Unauthorized', { status: 401 })),
        ),
      );

      await expect(
        postGoogleLoginToApi('invalid-token', 'antiforgery-token'),
      ).rejects.toThrow('Google login failed: 401 Unauthorized');
    });

    it('handles empty error response', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          Promise.resolve(new Response('', { status: 400 })),
        ),
      );

      await expect(
        postGoogleLoginToApi('token', 'antiforgery-token'),
      ).rejects.toThrow('Google login failed: 400');
    });
  });
});
