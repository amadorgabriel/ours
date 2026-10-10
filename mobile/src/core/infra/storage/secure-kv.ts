import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function browserStorage(): Storage | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage;
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return browserStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = browserStorage();
    if (!storage) {
      throw new Error('localStorage is unavailable');
    }

    storage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    browserStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
