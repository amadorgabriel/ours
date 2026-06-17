import * as SecureStore from 'expo-secure-store';

import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from '../auth-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('auth-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads token from secure store', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-abc');

    await expect(getStoredAuthToken()).resolves.toBe('token-abc');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('po_auth_token');
  });

  it('writes token to secure store', async () => {
    await setStoredAuthToken('token-xyz');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('po_auth_token', 'token-xyz');
  });

  it('clears token from secure store', async () => {
    await clearStoredAuthToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('po_auth_token');
  });
});
