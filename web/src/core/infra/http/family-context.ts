type FamilyIdGetter = () => string | null;

let familyIdGetter: FamilyIdGetter | null = null;

export function registerFamilyIdGetter(getter: FamilyIdGetter): void {
  familyIdGetter = getter;
}

export function unregisterFamilyIdGetter(): void {
  familyIdGetter = null;
}

export function getActiveFamilyId(): string | null {
  return familyIdGetter?.() ?? null;
}
