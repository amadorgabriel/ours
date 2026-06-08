import { HttpClientError } from '@/core/infra/http/http-error';

type FamilyErrorContext = 'create' | 'join' | 'invite';

type FamilyErrorTranslator = (
  key:
    | 'errors.createFailed'
    | 'errors.joinFailed'
    | 'errors.inviteFailed'
    | 'errors.invalidName'
    | 'errors.inviteExpired'
    | 'errors.codeNotFound'
    | 'errors.alreadyMember'
    | 'errors.notAdmin'
    | 'errors.missingFamilyId'
    | 'errors.generic'
) => string;

export function getFamilyErrorMessage(
  error: unknown,
  t: FamilyErrorTranslator,
  context: FamilyErrorContext
): string {
  if (!(error instanceof HttpClientError)) {
    if (context === 'create') return t('errors.createFailed');
    if (context === 'join') return t('errors.joinFailed');
    return t('errors.inviteFailed');
  }

  switch (error.statusCode) {
    case 400:
      if (context === 'create') return t('errors.invalidName');
      if (context === 'join') return t('errors.inviteExpired');
      return t('errors.generic');
    case 403:
      return t('errors.notAdmin');
    case 404:
      return t('errors.codeNotFound');
    case 409:
      return t('errors.alreadyMember');
    default:
      if (context === 'create') return t('errors.createFailed');
      if (context === 'join') return t('errors.joinFailed');
      return t('errors.inviteFailed');
  }
}
