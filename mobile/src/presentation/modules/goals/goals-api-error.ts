import { HttpClientError } from '@/core/infra/http/http-error';

const messages = {
  createFailed: 'Não foi possível criar a meta. Tente novamente.',
  invalidInput: 'Verifique título e valor alvo (mínimo R$ 10,00).',
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
