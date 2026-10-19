export function joinLanding(code) {
  const inviteCode = String(code ?? '').trim().toUpperCase();
  const href = `projectours://join/${inviteCode}`;
  return { inviteCode, href };
}
