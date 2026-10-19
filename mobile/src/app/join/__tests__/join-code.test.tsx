import renderer, { act } from 'react-test-renderer';

const redirects: string[] = [];

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ code: 'AB12CD' }),
  Redirect: ({ href }: { href: string }) => {
    redirects.push(href);
    return null;
  },
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

import JoinDeepLinkScreen from '../[code]';

describe('join deep link', () => {
  it('login keeps the invite query', () => {
    redirects.length = 0;

    act(() => {
      renderer.create(<JoinDeepLinkScreen />);
    });

    expect(redirects).toContain('/(auth)/login?invite=AB12CD');
  });
});
