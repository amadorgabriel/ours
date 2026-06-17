let currentAuthToken: string | null = null;

export function setInMemoryAuthToken(token: string | null): void {
  currentAuthToken = token;
}

export function getInMemoryAuthToken(): string | null {
  return currentAuthToken;
}
