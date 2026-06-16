'use client';

import { useRouter } from '@/i18n/navigation';
import { Page } from '@/ui/Layout/Page';

import { FamilySetupForms } from '../setup-forms';

export function OnboardingPage() {
  const router = useRouter();

  return (
    <Page size="xl">
      <FamilySetupForms variant="onboarding" onSuccess={() => router.replace('/dashboard')} />
    </Page>
  );
}
