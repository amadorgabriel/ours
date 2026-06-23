import { HttpClientError } from '@/core/infra/http/http-error';

type FamilyErrorContext = 'create' | 'join' | 'invite';

const messages = {
  createFailed: 'Não foi possível criar a família. Tente novamente.',
  joinFailed: 'Não foi possível entrar na família. Tente novamente.',
  inviteFailed: 'Não foi possível gerar o convite. Tente novamente.',
  invalidName: 'Nome inválido. Verifique e tente novamente.',
  inviteExpired: 'Código expirado ou inválido.',
  codeNotFound: 'Código não encontrado.',
  alreadyMember: 'Você já faz parte desta família.',
  notAdmin: 'Apenas administradores podem convidar.',
  missingFamilyId: 'Selecione uma família ativa antes de convidar.',
  generic: 'Algo deu errado. Tente novamente.',
  removeMemberFailed: 'Não foi possível remover o membro. Tente novamente.',
  lastAdmin: 'Não é possível remover o último administrador da família.',
  memberNotFound: 'Membro não encontrado nesta família.',
} as const;

export function getFamilyErrorMessage(error: unknown, context: FamilyErrorContext): string {
  if (!(error instanceof HttpClientError)) {
    if (context === 'create') return messages.createFailed;
    if (context === 'join') return messages.joinFailed;
    return messages.inviteFailed;
  }

  switch (error.statusCode) {
    case 400:
      if (context === 'create') return messages.invalidName;
      if (context === 'join') return messages.inviteExpired;
      if (context === 'invite') return messages.missingFamilyId;
      return messages.generic;
    case 403:
      return messages.notAdmin;
    case 404:
      return messages.codeNotFound;
    case 409:
      return messages.alreadyMember;
    default:
      if (context === 'create') return messages.createFailed;
      if (context === 'join') return messages.joinFailed;
      return messages.inviteFailed;
  }
}

export function getRemoveMemberErrorMessage(error: unknown): string {
  if (!(error instanceof HttpClientError)) {
    return messages.removeMemberFailed;
  }

  switch (error.statusCode) {
    case 403:
      return messages.notAdmin;
    case 404:
      return messages.memberNotFound;
    case 409:
      return messages.lastAdmin;
    default:
      return messages.removeMemberFailed;
  }
}
