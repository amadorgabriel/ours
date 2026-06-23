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
import { useQueryClient } from '@tanstack/react-query';

import type { ParentId } from '@/core/domain/parent';
import {
  getStoredAssistidoFilter,
  setStoredAllAssistidos,
  setStoredParentId,
  clearStoredParentId,
} from '@/core/infra/storage/assistido-storage';
import { prefetchParentsForFamily } from '@/core/services/usecases/parent/prefetch-parents';
import { useParents } from '@/core/services/usecases/parent/index.hooks';

import { useFamily } from '../family';
import type { AssistidoContextValue } from './index.types';

const AssistidoContext = createContext<AssistidoContextValue | null>(null);

export function AssistidoProvider({ children }: { children: ReactNode }) {
  const { familyId } = useFamily();
  const queryClient = useQueryClient();
  const { data: parents = [], isLoading } = useParents(familyId);
  const [parentId, setParentIdState] = useState<ParentId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const skipAutoSelectRef = useRef(false);

  useEffect(() => {
    if (!familyId) {
      return;
    }

    void prefetchParentsForFamily(queryClient, familyId);
  }, [familyId, queryClient]);

  useEffect(() => {
    let cancelled = false;
    setIsHydrated(false);
    skipAutoSelectRef.current = false;

    if (!familyId) {
      setParentIdState(null);
      return;
    }

    void getStoredAssistidoFilter(familyId).then((stored) => {
      if (cancelled) {
        return;
      }

      if (stored === 'all') {
        skipAutoSelectRef.current = true;
        setParentIdState(null);
      } else {
        setParentIdState(stored);
      }

      setIsHydrated(true);
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
        skipAutoSelectRef.current = true;
        return;
      }

      void clearStoredParentId(familyId);
      setParentIdState(null);
    }

    if (skipAutoSelectRef.current) return;

    skipAutoSelectRef.current = true;
    const first = parents[0];
    setParentIdState(first.id);
    void setStoredParentId(familyId, first.id);
  }, [isHydrated, isLoading, familyId, parents, parentId]);

  const setParentId = useCallback(
    (id: ParentId | null) => {
      setParentIdState(id);
      skipAutoSelectRef.current = true;

      if (!familyId) return;

      if (id) {
        void setStoredParentId(familyId, id);
      } else {
        void setStoredAllAssistidos(familyId);
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
