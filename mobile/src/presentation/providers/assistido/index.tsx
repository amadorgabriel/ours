import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ParentId } from '@/core/domain/parent';
import {
  clearStoredParentId,
  getStoredParentId,
  setStoredParentId,
} from '@/core/infra/storage/assistido-storage';
import { useParents } from '@/core/services/usecases/parent/index.hooks';

import { useFamily } from '../family';
import type { AssistidoContextValue } from './index.types';

const AssistidoContext = createContext<AssistidoContextValue | null>(null);

export function AssistidoProvider({ children }: { children: ReactNode }) {
  const { familyId } = useFamily();
  const { data: parents = [], isLoading } = useParents(familyId);
  const [parentId, setParentIdState] = useState<ParentId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsHydrated(false);

    if (!familyId) {
      setParentIdState(null);
      setIsHydrated(true);
      return;
    }

    void getStoredParentId(familyId).then((stored) => {
      if (!cancelled) {
        setParentIdState(stored);
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [familyId]);

  useEffect(() => {
    if (!isHydrated || isLoading || !parentId || parents.length === 0) return;

    const isValid = parents.some((parent) => parent.id === parentId);
    if (!isValid) {
      setParentIdState(null);
      if (familyId) {
        void clearStoredParentId(familyId);
      }
    }
  }, [parents, parentId, isLoading, isHydrated, familyId]);

  const setParentId = useCallback(
    (id: ParentId | null) => {
      setParentIdState(id);

      if (!familyId) return;

      if (id) {
        void setStoredParentId(familyId, id);
      } else {
        void clearStoredParentId(familyId);
      }
    },
    [familyId]
  );

  const activeParent = useMemo(
    () => parents.find((parent) => parent.id === parentId) ?? null,
    [parents, parentId]
  );

  const value = useMemo<AssistidoContextValue>(
    () => ({
      parentId,
      activeParent,
      parents,
      isLoading: isLoading || !isHydrated,
      setParentId,
    }),
    [parentId, activeParent, parents, isLoading, isHydrated, setParentId]
  );

  return <AssistidoContext.Provider value={value}>{children}</AssistidoContext.Provider>;
}

export function useAssistido(): AssistidoContextValue {
  const context = useContext(AssistidoContext);
  if (!context) {
    throw new Error('useAssistido must be used within AssistidoProvider');
  }
  return context;
}
