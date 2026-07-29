import * as SecureStore from 'expo-secure-store';

import {
  clearStoredParentId,
  getStoredAssistidoFilter,
  getStoredParentId,
  setStoredAllAssistidos,
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

  it('reads parent id scoped by family with valid key', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('parent-1');

    await expect(getStoredParentId('family-1')).resolves.toBe('parent-1');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('po_assistido.family-1');
  });

  it('writes parent id scoped by family', async () => {
    await setStoredParentId('family-1', 'parent-2');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('po_assistido.family-1', 'parent-2');
  });

  it('clears parent id scoped by family including legacy key', async () => {
    await clearStoredParentId('family-1');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('po_assistido.family-1');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('po_assistido:family-1');
  });

  it('migrates legacy key with colon to valid key', async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('parent-legacy');

    await expect(getStoredParentId('family-1')).resolves.toBe('parent-legacy');

    expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(1, 'po_assistido.family-1');
    expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(2, 'po_assistido:family-1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('po_assistido.family-1', 'parent-legacy');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('po_assistido:family-1');
  });

  it('returns all when sentinel is stored', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('__all__');

    await expect(getStoredAssistidoFilter('family-1')).resolves.toBe('all');
    await expect(getStoredParentId('family-1')).resolves.toBeNull();
  });

  it('persists all assistidos sentinel', async () => {
    await setStoredAllAssistidos('family-1');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('po_assistido.family-1', '__all__');
  });

  it('does not access storage when familyId is missing', async () => {
    await expect(getStoredParentId(null)).resolves.toBeNull();
    await setStoredParentId(undefined, 'parent-1');
    await setStoredAllAssistidos('');
    await clearStoredParentId(null);

    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it('degrades to null when SecureStore throws', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Invalid key'));

    await expect(getStoredParentId('family-1')).resolves.toBeNull();
  });

  it('returns null when legacy key read throws without failing new key read', async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('Invalid key'));

    await expect(getStoredParentId('family-1')).resolves.toBeNull();
    expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(1, 'po_assistido.family-1');
    expect(SecureStore.getItemAsync).toHaveBeenNthCalledWith(2, 'po_assistido:family-1');
  });
});
