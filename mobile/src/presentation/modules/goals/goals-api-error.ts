import { HttpClientError } from '@/core/infra/http/http-error';

const messages = {
  createFailed: 'Não foi possível criar a meta. Tente novamente.',
  contributeFailed: 'Não foi possível registrar a contribuição. Tente novamente.',
  invalidInput: 'Verifique título e valor alvo (mínimo R$ 10,00).',
  invalidContribution: 'Informe um valor válido (mínimo R$ 1,00).',
  notAdmin: 'Apenas administradores podem criar metas.',
  missingFamilyId: 'Selecione uma família ativa.',
  generic: 'Algo deu errado. Tente novamente.',
} as const;

export function getGoalErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return messages.createFailed;
  }

  switch (error.statusCode) {
    case 400:
      return messages.invalidInput;
    case 403:
      return messages.notAdmin;
    default:
      return messages.createFailed;
  }
}

export function getContributionErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return messages.contributeFailed;
  }

  switch (error.statusCode) {
    case 400:
      return messages.invalidContribution;
    case 404:
      return messages.contributeFailed;
    default:
      return messages.contributeFailed;
  }
}
