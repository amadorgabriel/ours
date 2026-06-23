import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  const autoSelectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setIsHydrated(false);
    autoSelectedRef.current = false;

    if (!familyId) {
      setParentIdState(null);
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
    if (!isHydrated || isLoading || !familyId || parents.length === 0) return;

    if (parentId !== null) {
      const isValid = parents.some((parent) => parent.id === parentId);
      if (isValid) {
        autoSelectedRef.current = true;
        return;
      }

      void clearStoredParentId(familyId);
    }

    if (autoSelectedRef.current) return;

    autoSelectedRef.current = true;
    const first = parents[0];
    setParentIdState(first.id);
    void setStoredParentId(familyId, first.id);
  }, [isHydrated, isLoading, familyId, parents, parentId]);

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
