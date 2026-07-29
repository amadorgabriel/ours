import { HttpClientError } from '@/core/infra/http/http-error';

type GoalErrorTranslator = (
  key:
    | 'errors.createFailed'
    | 'errors.contributeFailed'
    | 'errors.invalidInput'
    | 'errors.invalidContribution'
    | 'errors.notAdmin'
    | 'errors.generic'
) => string;

export function getGoalErrorMessage(error: unknown, t: GoalErrorTranslator): string {
  if (!(error instanceof HttpClientError)) {
    return t('errors.createFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.invalidInput');
    case 403:
      return t('errors.notAdmin');
    default:
      return t('errors.createFailed');
  }
}

export function getContributionErrorMessage(error: unknown, t: GoalErrorTranslator): string {
  if (!(error instanceof HttpClientError)) {
    return t('errors.contributeFailed');
  }

  switch (error.statusCode) {
    case 400:
      return t('errors.invalidContribution');
    default:
      return t('errors.contributeFailed');
  }
}
