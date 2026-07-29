import { HttpClientError } from '@/core/infra/http/http-error';
import { t } from '@/core/infra/i18n';

export function getGoalErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return t('errors.goals.createFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.goals.invalidInput');
    case 403:
      return t('errors.goals.notAdmin');
    default:
      return t('errors.goals.createFailed');
  }
}

export function getContributionErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return t('errors.goals.contributeFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.goals.invalidContribution');
    case 404:
      return t('errors.goals.contributeFailed');
    default:
      return t('errors.goals.contributeFailed');
  }
}

export function getDeleteGoalErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return t('errors.goals.deleteFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.goals.deleteBlockedContributions');
    case 403:
      return t('errors.goals.deleteForbidden');
    case 404:
      return t('errors.goals.notFound');
    default:
      return t('errors.goals.deleteFailed');
  }
}
