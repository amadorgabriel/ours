type AuthTokenGetter = () => string | null;

let authTokenGetter: AuthTokenGetter | null = null;

export function registerAuthTokenGetter(getter: AuthTokenGetter): void {
  authTokenGetter = getter;
}

export function unregisterAuthTokenGetter(): void {
  authTokenGetter = null;
}

export function getAuthToken(): string | null {
  return authTokenGetter?.() ?? null;
}
