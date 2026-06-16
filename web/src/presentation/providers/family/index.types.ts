import type { FamilyId } from '@/core/domain/family';

export type FamilyContextValue = {
  familyId: FamilyId | null;
  setFamilyId: (id: FamilyId | null) => void;
};
