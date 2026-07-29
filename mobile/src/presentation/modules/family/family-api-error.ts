import { HttpClientError } from '@/core/infra/http/http-error';
import { t } from '@/core/infra/i18n';

type FamilyErrorContext = 'create' | 'join' | 'invite';

export function getFamilyErrorMessage(error: unknown, context: FamilyErrorContext): string {
  if (!(error instanceof HttpClientError)) {
    if (context === 'create') return t('errors.family.createFailed');
    if (context === 'join') return t('errors.family.joinFailed');
    return t('errors.family.inviteFailed');
  }

  switch (error.statusCode) {
    case 400:
      if (context === 'create') return t('errors.family.invalidName');
      if (context === 'join') return t('errors.family.inviteExpired');
      if (context === 'invite') return t('errors.family.missingFamilyId');
      return t('errors.family.generic');
    case 403:
      return t('errors.family.notAdmin');
    case 404:
      return t('errors.family.codeNotFound');
    case 409:
      return t('errors.family.alreadyMember');
    default:
      if (context === 'create') return t('errors.family.createFailed');
      if (context === 'join') return t('errors.family.joinFailed');
      return t('errors.family.inviteFailed');
  }
}

export function getRemoveMemberErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return t('errors.family.removeMemberFailed');
  }

  switch (error.statusCode) {
    case 403:
      return t('errors.family.notAdmin');
    case 404:
      return t('errors.family.memberNotFound');
    case 409:
      return t('errors.family.lastAdmin');
    default:
      return t('errors.family.removeMemberFailed');
  }
}
