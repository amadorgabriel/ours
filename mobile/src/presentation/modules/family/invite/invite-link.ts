export function buildInviteUrl(inviteCode: string): string {
  const raw = process.env.EXPO_PUBLIC_INVITE_BASE_URL?.trim();
  if (!raw) {
    return `projectours://join/${inviteCode}`;
  }

  const origin = raw.replace(/\/+$/, '');
  return `${origin}/join/${inviteCode}`;
}
