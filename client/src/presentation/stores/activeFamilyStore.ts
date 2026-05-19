import { create } from 'zustand';

export type ActiveFamilyState = {
  familyId: string | null;
};

export type ActiveFamilyActions = {
  setFamilyId: (familyId: string | null) => void;
  clearFamilyId: () => void;
};

export type ActiveFamilyStore = ActiveFamilyState & ActiveFamilyActions;

export const activeFamilyInitialState: ActiveFamilyState = {
  familyId: null,
};

export const useActiveFamilyStore = create<ActiveFamilyStore>((set) => ({
  ...activeFamilyInitialState,
  setFamilyId: (familyId) => set({ familyId }),
  clearFamilyId: () => set(activeFamilyInitialState),
}));

export const selectActiveFamilyId = (state: ActiveFamilyStore) => state.familyId;

export function getActiveFamilyIdSnapshot() {
  return useActiveFamilyStore.getState().familyId;
}
