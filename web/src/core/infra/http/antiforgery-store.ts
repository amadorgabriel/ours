let cachedToken: string | null = null;

export function getCachedAntiforgeryToken(): string | null {
  return cachedToken;
}

export function setCachedAntiforgeryToken(token: string | null): void {
  cachedToken = token;
}
