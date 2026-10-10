import type { FamilyId } from '@/core/domain/family';
import type { ParentId } from '@/core/domain/parent';

import { deleteSecureItem, getSecureItem, setSecureItem } from './secure-kv';

const ALL_ASSISTIDOS_SENTINEL = '__all__';

function storageKey(familyId: FamilyId): string {
  return `po_assistido.${familyId}`;
}

function legacyStorageKey(familyId: FamilyId): string {
  return `po_assistido:${familyId}`;
}

function isValidFamilyId(familyId: FamilyId | null | undefined): familyId is FamilyId {
  return Boolean(familyId);
}

async function readStoredValue(familyId: FamilyId): Promise<string | null> {
  const key = storageKey(familyId);
  let value: string | null = null;

  try {
    value = await getSecureItem(key);
  } catch {
    // degrade silently (web/simulator)
  }

  if (value) {
    return value;
  }

  const legacyKey = legacyStorageKey(familyId);
  let legacyValue: string | null = null;

  try {
    legacyValue = await getSecureItem(legacyKey);
  } catch {
    return null;
  }

  if (!legacyValue) {
    return null;
  }

  try {
    await setSecureItem(key, legacyValue);
    await deleteSecureItem(legacyKey);
  } catch {
    return legacyValue;
  }

  return legacyValue;
}

export type StoredAssistidoFilter = ParentId | 'all' | null;

export async function getStoredAssistidoFilter(
  familyId: FamilyId | null | undefined
): Promise<StoredAssistidoFilter> {
  if (!isValidFamilyId(familyId)) {
    return null;
  }

  try {
    const value = await readStoredValue(familyId);
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

export async function getStoredParentId(
  familyId: FamilyId | null | undefined
): Promise<ParentId | null> {
  const filter = await getStoredAssistidoFilter(familyId);
  if (!filter || filter === 'all') {
    return null;
  }

  return filter;
}

export async function setStoredParentId(
  familyId: FamilyId | null | undefined,
  parentId: ParentId
): Promise<void> {
  if (!isValidFamilyId(familyId)) {
    return;
  }

  try {
    await setSecureItem(storageKey(familyId), parentId);
  } catch {
    // degrade silently (web/simulator)
  }
}

export async function setStoredAllAssistidos(
  familyId: FamilyId | null | undefined
): Promise<void> {
  if (!isValidFamilyId(familyId)) {
    return;
  }

  try {
    await setSecureItem(storageKey(familyId), ALL_ASSISTIDOS_SENTINEL);
  } catch {
    // degrade silently (web/simulator)
  }
}

export async function clearStoredParentId(
  familyId: FamilyId | null | undefined
): Promise<void> {
  if (!isValidFamilyId(familyId)) {
    return;
  }

  try {
    await deleteSecureItem(storageKey(familyId));
    await deleteSecureItem(legacyStorageKey(familyId));
  } catch {
    // degrade silently (web/simulator)
  }
}
