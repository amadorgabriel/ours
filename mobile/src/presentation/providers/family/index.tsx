import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { FamilyId } from '@/core/domain/family';
import {
  registerFamilyIdGetter,
  unregisterFamilyIdGetter,
} from '@/core/infra/http/family-context';

import type { FamilyContextValue } from './index.types';

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [familyId, setFamilyIdState] = useState<FamilyId | null>(null);
  const familyIdRef = useRef(familyId);
  familyIdRef.current = familyId;

  const setFamilyId = useCallback((id: FamilyId | null) => {
    familyIdRef.current = id;
    setFamilyIdState(id);
  }, []);

  useEffect(() => {
    registerFamilyIdGetter(() => familyIdRef.current);
    return () => unregisterFamilyIdGetter();
  }, []);

  const value = useMemo<FamilyContextValue>(
    () => ({ familyId, setFamilyId }),
    [familyId]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily(): FamilyContextValue {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within FamilyProvider');
  }
  return context;
}
