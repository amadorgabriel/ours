import { HttpClientError } from '@/core/infra/http/http-error';

const messages = {
  createFailed: 'Não foi possível cadastrar o assistido. Tente novamente.',
  updateFailed: 'Não foi possível atualizar o assistido. Tente novamente.',
  invalidInput: 'Informe nome e relação válidos.',
  notAdmin: 'Apenas administradores podem gerenciar assistidos.',
  generic: 'Algo deu errado. Tente novamente.',
} as const;

export function getParentErrorMessage(error: unknown, action: 'create' | 'update' = 'create'): string {
  if (!(error instanceof HttpClientError)) {
    return action === 'create' ? messages.createFailed : messages.updateFailed;
  }

  switch (error.statusCode) {
    case 400:
      return messages.invalidInput;
    case 403:
      return messages.notAdmin;
    default:
      return action === 'create' ? messages.createFailed : messages.updateFailed;
  }
}
