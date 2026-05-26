import type { AuthResponse } from '@/core/domain/auth/types';

const antiforgeryPath = '/api/auth/antiforgery';
const googleLoginPath = '/api/auth/google';

export async function fetchAntiforgeryTokenFromApi(): Promise<string> {
  const res = await fetch(antiforgeryPath, { credentials: 'include', method: 'GET' });
  if (!res.ok) {
    throw new Error(`Antiforgery request failed: ${res.status}`);
  }
  const data = (await res.json()) as { requestToken?: string };
  if (!data.requestToken) {
    throw new Error('Missing requestToken in antiforgery response');
  }
  return data.requestToken;
}

export async function postGoogleLoginToApi(
  idToken: string,
  requestVerificationToken: string,
): Promise<AuthResponse> {
  const res = await fetch(googleLoginPath, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      RequestVerificationToken: requestVerificationToken,
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google login failed: ${res.status} ${text}`);
  }

  // Parse e retorna o AuthResponse
  const data = (await res.json()) as AuthResponse;
  return data;
}
