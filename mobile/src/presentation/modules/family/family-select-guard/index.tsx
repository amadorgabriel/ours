import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/presentation/providers/auth';
import { useFamily } from '@/presentation/providers/family';

import { getFamilySelectRedirect } from '@/presentation/modules/auth/auth-redirect';

type FamilySelectGuardProps = {
  children: ReactNode;
};

export function FamilySelectGuard({ children }: FamilySelectGuardProps) {
  const { session } = useAuth();
  const { familyId } = useFamily();
  const router = useRouter();

  const redirectTo = getFamilySelectRedirect(session?.familyCount, familyId);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo as Href);
    }
  }, [redirectTo, router]);

  if (redirectTo) {
    return null;
  }

  return children;
}
