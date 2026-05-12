import { create } from 'zustand';

type ActiveFamilyState = {
  familyId: string | null;
  setFamilyId: (id: string | null) => void;
};

export const useActiveFamilyStore = create<ActiveFamilyState>((set) => ({
  familyId: null,
  setFamilyId: (familyId) => set({ familyId }),
}));
