'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { DashboardShell } from './DashboardShell';
import { DashboardHome } from './DashboardHome';
import { OnboardingEmbed } from './OnboardingEmbed';
import { FamilyPicker } from './FamilyPicker';
import type { AuthUser } from '@/core/domain/auth/types';

interface DashboardPageProps {
  initialUser?: AuthUser;
}

// TODO: Replace with actual API call to get current user
async function fetchCurrentUser(): Promise<AuthUser | null> {
  // Placeholder - should call GET /api/me or similar
  return null;
}

export function DashboardPage({ initialUser }: DashboardPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser || null);
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (!initialUser) {
      fetchCurrentUser()
        .then((u) => {
          setUser(u);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [initialUser]);

  // Determine what to show based on user state
  const familyCount = user?.families?.length || 0;
  const hasActiveFamily = activeFamilyId !== null;

  // If no families or explicit onboarding mode
  const needsOnboarding = showOnboarding || familyCount === 0;

  // If multiple families and none selected
  const needsFamilyPicker = familyCount > 1 && !hasActiveFamily && !needsOnboarding;

  const handleFamilySelect = (familyId: string) => {
    setActiveFamilyId(familyId);
  };

  const handleCreateFamily = (familyName: string) => {
    // TODO: Call API to create family, then refresh user data
    void familyName;
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <DashboardShell userName={user?.name} userPicture={user?.picture}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DashboardShell>
    );
  }

  // Not authenticated
  if (!user) {
    // This shouldn't happen due to middleware, but handle gracefully
    router.push('/login');
    return null;
  }

  const activeFamily = user.families?.find((f) => f.id === activeFamilyId);
  const displayFamily = activeFamily || user.families?.[0];

  return (
    <DashboardShell userName={user.name} userPicture={user.picture}>
      {needsOnboarding ? (
        <OnboardingEmbed
          onComplete={(name) => {
            handleCreateFamily(name);
          }}
        />
      ) : needsFamilyPicker ? (
        <FamilyPicker
          families={
            user.families?.map((f) => ({
              id: f.id,
              name: f.name,
              role: f.role,
              memberCount: 2, // TODO: Get from API
            })) || []
          }
          onSelect={handleFamilySelect}
          onCreateNew={() => setShowOnboarding(true)}
        />
      ) : (
        <DashboardHome
          userName={user.name}
          familyName={displayFamily?.name}
        />
      )}
    </DashboardShell>
  );
}