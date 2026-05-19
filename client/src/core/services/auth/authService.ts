import { fetchAntiforgeryTokenFromApi, postGoogleLoginToApi } from './authGateway';

export async function fetchAntiforgeryToken() {
  return fetchAntiforgeryTokenFromApi();
}

export async function postGoogleLogin(idToken: string, requestVerificationToken: string) {
  return postGoogleLoginToApi(idToken, requestVerificationToken);
}
