import type { FamilyId } from '@/core/domain/family';
import type { ParentId } from '@/core/domain/parent';

import * as SecureStore from 'expo-secure-store';

function storageKey(familyId: FamilyId): string {
  return `po_assistido:${familyId}`;
}

export async function getStoredParentId(familyId: FamilyId): Promise<ParentId | null> {
  try {
    return await SecureStore.getItemAsync(storageKey(familyId));
  } catch {
    return null;
  }
}

export async function setStoredParentId(familyId: FamilyId, parentId: ParentId): Promise<void> {
  await SecureStore.setItemAsync(storageKey(familyId), parentId);
}

export async function clearStoredParentId(familyId: FamilyId): Promise<void> {
  await SecureStore.deleteItemAsync(storageKey(familyId));
}
