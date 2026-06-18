import { HttpClientError } from '@/core/infra/http/http-error';

type FamilyErrorContext = 'create' | 'join';

const messages = {
  createFailed: 'Não foi possível criar a família. Tente novamente.',
  joinFailed: 'Não foi possível entrar na família. Tente novamente.',
  invalidName: 'Nome inválido. Verifique e tente novamente.',
  inviteExpired: 'Código expirado ou inválido.',
  codeNotFound: 'Código não encontrado.',
  alreadyMember: 'Você já faz parte desta família.',
  generic: 'Algo deu errado. Tente novamente.',
} as const;

export function getFamilyErrorMessage(error: unknown, context: FamilyErrorContext): string {
  if (!(error instanceof HttpClientError)) {
    return context === 'create' ? messages.createFailed : messages.joinFailed;
  }

  switch (error.statusCode) {
    case 400:
      return context === 'create' ? messages.invalidName : messages.inviteExpired;
    case 404:
      return messages.codeNotFound;
    case 409:
      return messages.alreadyMember;
    default:
      return context === 'create' ? messages.createFailed : messages.joinFailed;
  }
}
