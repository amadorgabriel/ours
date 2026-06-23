import { HttpClientError } from '@/core/infra/http/http-error';
import { t } from '@/core/infra/i18n';

export function getParentErrorMessage(error: unknown, action: 'create' | 'update' = 'create'): string {
  if (!(error instanceof HttpClientError)) {
    return action === 'create'
      ? t('errors.parents.createFailed')
      : t('errors.parents.updateFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.parents.invalidInput');
    case 403:
      return t('errors.parents.notAdmin');
    default:
      return action === 'create'
        ? t('errors.parents.createFailed')
        : t('errors.parents.updateFailed');
  }
}
