import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { FamilyId } from '@/core/domain/family';
import {
  registerFamilyIdGetter,
  unregisterFamilyIdGetter,
} from '@/core/infra/http/family-context';

import type { FamilyContextValue } from './index.types';

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [familyId, setFamilyId] = useState<FamilyId | null>(null);

  useEffect(() => {
    registerFamilyIdGetter(() => familyId);
    return () => unregisterFamilyIdGetter();
  }, [familyId]);

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
