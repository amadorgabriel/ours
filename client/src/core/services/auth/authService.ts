import type { AuthResponse } from '@/core/domain/auth/types';

import { fetchAntiforgeryTokenFromApi, postGoogleLoginToApi } from './authGateway';

export async function fetchAntiforgeryToken(): Promise<string> {
  return fetchAntiforgeryTokenFromApi();
}

export async function postGoogleLogin(
  idToken: string,
  requestVerificationToken: string,
): Promise<AuthResponse> {
  return postGoogleLoginToApi(idToken, requestVerificationToken);
}

export type { AuthResponse };
