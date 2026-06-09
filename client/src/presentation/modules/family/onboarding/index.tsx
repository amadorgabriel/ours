'use client';

import { useRouter } from '@/i18n/navigation';
import { Container } from '@/ui/Layout/Container';

import { FamilySetupForms } from '../setup-forms';

export function OnboardingPage() {
  const router = useRouter();

  return (
    <Container className="py-10" size="sm">
      <FamilySetupForms variant="onboarding" onSuccess={() => router.replace('/dashboard')} />
    </Container>
  );
}
