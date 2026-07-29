import { useEffect, useState, type ReactNode } from 'react';

import {
  hydrateAuthTokenFromStorage,
  registerAuthTokenFromMemory,
  unregisterAuthTokenFromMemory,
  useSession,
} from '@/core/services/usecases/auth/index.hooks';
import { useAuth } from '@/presentation/providers/auth';

type SessionBootstrapProps = {
  children: ReactNode;
};

export function SessionBootstrap({ children }: SessionBootstrapProps) {
  const { setIsSessionLoading } = useAuth();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    registerAuthTokenFromMemory();
    void hydrateAuthTokenFromStorage().finally(() => setTokenReady(true));
    return () => unregisterAuthTokenFromMemory();
  }, []);

  const { isPending, isFetching } = useSession(tokenReady);

  useEffect(() => {
    setIsSessionLoading(!tokenReady || isPending || isFetching);
  }, [tokenReady, isPending, isFetching, setIsSessionLoading]);

  return children;
}
