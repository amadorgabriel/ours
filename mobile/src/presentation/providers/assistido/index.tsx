import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
  const { data: parents = [], isLoading, isError, refetch } = useParents(familyId);
  const [parentId, setParentIdState] = useState<ParentId | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const skipAutoSelectRef = useRef(false);
  const allowAutoSelectRef = useRef(false);

  useEffect(() => {
    if (!familyId) {
      return;
    }

    void prefetchParentsForFamily(queryClient, familyId);
  }, [familyId, queryClient]);

  useLayoutEffect(() => {
    skipAutoSelectRef.current = false;
    allowAutoSelectRef.current = false;

    if (!familyId) {
      setParentIdState(null);
      setIsHydrated(true);
      return;
    }

    setIsHydrated(false);
  }, [familyId]);

  useEffect(() => {
    let cancelled = false;

    if (!familyId) {
      return;
    }

    void getStoredAssistidoFilter(familyId).then((stored) => {
      if (cancelled) {
        return;
      }

      if (stored === 'all') {
        skipAutoSelectRef.current = true;
        allowAutoSelectRef.current = false;
        setParentIdState(null);
      } else if (stored !== null) {
        skipAutoSelectRef.current = true;
        allowAutoSelectRef.current = false;
        setParentIdState(stored);
      } else {
        skipAutoSelectRef.current = false;
        allowAutoSelectRef.current = true;
        setParentIdState(null);
      }

      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [familyId]);

  useEffect(() => {
    if (!isHydrated || isLoading || !familyId) return;
    if (parents.length > 0) return;

    if (parentId !== null) {
      void clearStoredParentId(familyId);
      setParentIdState(null);
    }
  }, [isHydrated, isLoading, familyId, parents.length, parentId]);

  useEffect(() => {
    if (!isHydrated || isLoading || !familyId || parents.length === 0) return;

    setParentIdState((currentParentId) => {
      if (currentParentId !== null) {
        const isValid = parents.some((parent) => parent.id === currentParentId);
        if (isValid) {
          skipAutoSelectRef.current = true;
          allowAutoSelectRef.current = false;
          return currentParentId;
        }

        void clearStoredParentId(familyId);
        skipAutoSelectRef.current = false;
        allowAutoSelectRef.current = true;
      }

      if (!allowAutoSelectRef.current || skipAutoSelectRef.current) {
        return currentParentId;
      }

      allowAutoSelectRef.current = false;
      skipAutoSelectRef.current = true;
      const first = parents[0];
      void setStoredParentId(familyId, first.id);
      return first.id;
    });
  }, [isHydrated, isLoading, familyId, parents]);

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
      isLoading: familyId ? isLoading || !isHydrated : false,
      isError,
      refetch: () => {
        void refetch();
      },
      setParentId,
    }),
    [parentId, activeParent, parents, isLoading, isHydrated, isError, refetch, setParentId, familyId]
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
