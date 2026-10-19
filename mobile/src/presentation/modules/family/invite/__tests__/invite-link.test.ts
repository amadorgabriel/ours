import { buildInviteUrl } from '../invite-link';

describe('buildInviteUrl', () => {
  const previous = process.env.EXPO_PUBLIC_INVITE_BASE_URL;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_INVITE_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_INVITE_BASE_URL = previous;
    }
  });

  it('appends a single join segment', () => {
    process.env.EXPO_PUBLIC_INVITE_BASE_URL = 'https://exemplo.vercel.app';

    expect(buildInviteUrl('AB12CD')).toBe('https://exemplo.vercel.app/join/AB12CD');
  });

  it('falls back to the app scheme', () => {
    delete process.env.EXPO_PUBLIC_INVITE_BASE_URL;

    const url = buildInviteUrl('AB12CD');

    expect(url).toBe('projectours://join/AB12CD');
    expect(url).not.toContain('ours.app');
  });
});
