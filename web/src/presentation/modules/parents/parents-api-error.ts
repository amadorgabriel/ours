import { HttpClientError } from '@/core/infra/http/http-error';

type ParentErrorTranslator = (
  key:
    | 'errors.createFailed'
    | 'errors.updateFailed'
    | 'errors.invalidInput'
    | 'errors.notAdmin'
    | 'errors.generic'
) => string;

export function getParentErrorMessage(
  error: unknown,
  t: ParentErrorTranslator,
  action: 'create' | 'update' = 'create'
): string {
  if (!(error instanceof HttpClientError)) {
    return action === 'create' ? t('errors.createFailed') : t('errors.updateFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.invalidInput');
    case 403:
      return t('errors.notAdmin');
    default:
      return action === 'create' ? t('errors.createFailed') : t('errors.updateFailed');
  }
}
