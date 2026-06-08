import type { AuthSessionModel } from '@/core/domain/auth';
import type { FamilyId } from '@/core/domain/family';

export function applyActiveFamilyFromSession(
  session: AuthSessionModel,
  setFamilyId: (id: FamilyId | null) => void
): void {
  if (session.familyCount === 1 && session.families[0]) {
    setFamilyId(session.families[0].id);
  }
}
