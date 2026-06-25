import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { AuthProvider } from '@/presentation/providers/auth';
import { FamilyProvider } from '@/presentation/providers/family';

import { OnboardingScreen } from '../index';

const mockReplace = jest.fn();
const mockCreateMutate = jest.fn();
const mockJoinMutate = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@/core/services/usecases/family/index.hooks', () => ({
  useCreateFamily: () => ({
    mutate: mockCreateMutate,
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

const mockLogoutMutateAsync = jest.fn();

jest.mock('@/core/services/usecases/auth/index.hooks', () => ({
  useLogout: () => ({
    mutateAsync: mockLogoutMutateAsync,
    isPending: false,
  }),
}));

jest.mock('@/presentation/providers/alert', () => ({
  useAppAlert: () => ({
    alert: jest.fn((_title, _message, buttons) => {
      const confirm = buttons?.find((button: { style?: string }) => button.style === 'destructive');
      confirm?.onPress?.();
    }),
  }),
}));

jest.mock('@/presentation/providers/auth', () => {
  const actual = jest.requireActual('@/presentation/providers/auth');
  return {
    ...actual,
    useAuth: () => ({
      isAuthenticated: true,
      isSessionLoading: false,
      session: { familyCount: 0 },
      setSession: jest.fn(),
      clearSession: jest.fn(),
    }),
  };
});

function renderOnboardingScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <FamilyProvider>
        <AuthProvider>
          <OnboardingScreen />
        </AuthProvider>
      </FamilyProvider>
    );
  });

  return tree;
}

function findButtonByLabel(tree: renderer.ReactTestRenderer, label: string) {
  const buttons = tree.root.findAll(
    (node) => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function'
  );

  const match = buttons.find((button) =>
    button.findAllByType(Text).some((node) => node.props.children === label)
  );

  if (!match) {
    throw new Error(`Button not found: ${label}`);
  }

  return match;
}

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogoutMutateAsync.mockResolvedValue(undefined);
    mockCreateMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });
    mockJoinMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.();
    });
  });

  it('renders create and join sections (M-FAM-01/02)', () => {
    const tree = renderOnboardingScreen();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Criar família');
    expect(json).toContain('Entrar com código');
    expect(json).toContain('Bem-vindo');
  });

  it('submits family name and navigates home after create', () => {
    const tree = renderOnboardingScreen();
    const nameInput = tree.root.findByProps({ accessibilityLabel: 'Nome da família' });

    act(() => {
      nameInput.props.onChangeText('Família Silva');
    });

    const createButton = findButtonByLabel(tree, 'Criar família');

    act(() => {
      createButton.props.onPress();
    });

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { name: 'Família Silva' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(mockReplace).toHaveBeenCalledWith('/(app)');
  });

  it('submits invite code and navigates home after join', () => {
    const tree = renderOnboardingScreen();
    const codeInput = tree.root.findByProps({ accessibilityLabel: 'Código de convite' });

    act(() => {
      codeInput.props.onChangeText('AB12CD');
    });

    const joinButton = findButtonByLabel(tree, 'Entrar na família');

    act(() => {
      joinButton.props.onPress();
    });

    expect(mockJoinMutate).toHaveBeenCalledWith(
      { inviteCode: 'AB12CD' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(mockReplace).toHaveBeenCalledWith('/(app)');
  });

  it('shows logout and navigates to login for authenticated users without family', async () => {
    const tree = renderOnboardingScreen();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Sair');

    const logoutButton = tree.root.findByProps({ accessibilityLabel: 'Sair da conta' });

    await act(async () => {
      logoutButton.props.onPress();
    });

    expect(mockLogoutMutateAsync).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});
