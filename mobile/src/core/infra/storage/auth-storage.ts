import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-kv';

const AUTH_TOKEN_KEY = 'po_auth_token';

export async function getStoredAuthToken(): Promise<string | null> {
  try {
    return await getSecureItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredAuthToken(token: string): Promise<void> {
  await setSecureItem(AUTH_TOKEN_KEY, token);
}

export async function clearStoredAuthToken(): Promise<void> {
  await deleteSecureItem(AUTH_TOKEN_KEY);
}
