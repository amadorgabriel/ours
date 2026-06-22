const DEFAULT_INVITE_BASE_URL = 'https://ours.app';

export function getInviteBaseUrl(): string {
  return process.env.EXPO_PUBLIC_INVITE_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_INVITE_BASE_URL;
}

export function buildInviteUrl(inviteCode: string): string {
  return `${getInviteBaseUrl()}/join/${inviteCode}`;
}

export function buildWhatsAppInviteUrl(inviteCode: string): string {
  const inviteUrl = buildInviteUrl(inviteCode);
  const message = `Olá! Estou te convidando para cuidar da nossa família no Ours.\nToque no link para entrar:\n${inviteUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
