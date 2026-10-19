import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { OnboardingScreen } from '@/presentation/modules/family/onboarding';

const mockJoinMutate = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn() }),
  useLocalSearchParams: () => ({ invite: 'AB12CD' }),
}));

jest.mock('@/core/services/usecases/family/index.hooks', () => ({
  useCreateFamily: () => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
  }),
  useJoinFamily: () => ({
    mutate: mockJoinMutate,
    reset: jest.fn(),
    isPending: false,
    isError: false,
  }),
}));

jest.mock('@/core/services/usecases/auth/index.hooks', () => ({
  useLogout: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/presentation/providers/alert', () => ({
  useAppAlert: () => ({ alert: jest.fn() }),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isSessionLoading: false,
    session: { familyCount: 1 },
    setSession: jest.fn(),
    clearSession: jest.fn(),
  }),
}));

describe('onboarding invite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('confirm posts the invite code', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<OnboardingScreen />);
    });

    const joinButton = tree.root.findAll(
      (node) => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function'
    ).find((button) => button.findAllByType(Text).some((node) => node.props.children === 'Entrar na família'));

    if (!joinButton) {
      throw new Error('join button missing');
    }

    act(() => {
      joinButton.props.onPress();
    });

    expect(mockJoinMutate).toHaveBeenCalledWith(
      { inviteCode: 'AB12CD' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });
});
