const DEFAULT_INVITE_BASE_URL = 'https://ours.app';

export function getInviteBaseUrl(): string {
  return process.env.EXPO_PUBLIC_INVITE_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_INVITE_BASE_URL;
}

export function buildInviteUrl(inviteCode: string): string {
  return `${getInviteBaseUrl()}/join/${inviteCode}`;
}
