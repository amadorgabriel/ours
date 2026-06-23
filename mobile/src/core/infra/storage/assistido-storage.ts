import type { FamilyId } from '@/core/domain/family';
import type { ParentId } from '@/core/domain/parent';

import * as SecureStore from 'expo-secure-store';

const ALL_ASSISTIDOS_SENTINEL = '__all__';

function storageKey(familyId: FamilyId): string {
  return `po_assistido:${familyId}`;
}

export type StoredAssistidoFilter = ParentId | 'all' | null;

export async function getStoredAssistidoFilter(
  familyId: FamilyId
): Promise<StoredAssistidoFilter> {
  try {
    const value = await SecureStore.getItemAsync(storageKey(familyId));
    if (!value) {
      return null;
    }

    if (value === ALL_ASSISTIDOS_SENTINEL) {
      return 'all';
    }

    return value;
  } catch {
    return null;
  }
}

export async function getStoredParentId(familyId: FamilyId): Promise<ParentId | null> {
  const filter = await getStoredAssistidoFilter(familyId);
  if (!filter || filter === 'all') {
    return null;
  }

  return filter;
}

export async function setStoredParentId(familyId: FamilyId, parentId: ParentId): Promise<void> {
  await SecureStore.setItemAsync(storageKey(familyId), parentId);
}

export async function setStoredAllAssistidos(familyId: FamilyId): Promise<void> {
  await SecureStore.setItemAsync(storageKey(familyId), ALL_ASSISTIDOS_SENTINEL);
}

export async function clearStoredParentId(familyId: FamilyId): Promise<void> {
  await SecureStore.deleteItemAsync(storageKey(familyId));
}
