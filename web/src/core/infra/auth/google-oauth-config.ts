export const googleOAuthClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(googleOAuthClientId);
}
