import * as SecureStore from 'expo-secure-store';

import {
  clearStoredParentId,
  getStoredParentId,
  setStoredParentId,
} from '../assistido-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('assistido-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads parent id scoped by family', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('parent-1');

    await expect(getStoredParentId('family-1')).resolves.toBe('parent-1');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('po_assistido:family-1');
  });

  it('writes parent id scoped by family', async () => {
    await setStoredParentId('family-1', 'parent-2');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('po_assistido:family-1', 'parent-2');
  });

  it('clears parent id scoped by family', async () => {
    await clearStoredParentId('family-1');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('po_assistido:family-1');
  });
});
