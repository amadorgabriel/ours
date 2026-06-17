export type FamilyId = string;

export type FamilyContextValue = {
  familyId: FamilyId | null;
  setFamilyId: (id: FamilyId | null) => void;
};
