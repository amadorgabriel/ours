'use client';

import { useEffect, type ReactNode } from 'react';

import { applyActiveFamilyFromSession } from '@/core/services/usecases/auth/apply-active-family';
import { useSession } from '@/core/services/usecases/auth/index.hooks';
import { useFamily } from '@/presentation/providers/family';

import { useAuth } from './index';

type SessionBootstrapProps = {
  children: ReactNode;
};

export function SessionBootstrap({ children }: SessionBootstrapProps) {
  const { setIsSessionLoading } = useAuth();
  const { setFamilyId } = useFamily();
  const { isPending, isFetching, data } = useSession();

  useEffect(() => {
    setIsSessionLoading(isPending || isFetching);
  }, [isPending, isFetching, setIsSessionLoading]);

  useEffect(() => {
    if (data) {
      applyActiveFamilyFromSession(data, setFamilyId);
    }
  }, [data, setFamilyId]);

  return children;
}
