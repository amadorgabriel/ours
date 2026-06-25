import { GoogleSignin } from '@react-native-google-signin/google-signin';
import renderer, { act } from 'react-test-renderer';

import { prepareGoogleSignInForAccountPicker } from '@/core/infra/auth/google-signin-session';

import { AuthProvider } from '@/presentation/providers/auth';
import { FamilyProvider } from '@/presentation/providers/family';

import { LoginScreen } from '../index';

const mockReplace = jest.fn();
const mockMutate = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/core/infra/auth/google-signin-config', () => ({
  isGoogleSignInConfigured: () => true,
  getGoogleWebClientId: () => 'web-client-id',
  getGoogleIosClientId: () => 'ios-client-id',
}));

jest.mock('@/core/services/usecases/auth/index.hooks', () => ({
  useLoginWithGoogle: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
  }),
}));

jest.mock('@/core/infra/auth/google-signin-session', () => ({
  prepareGoogleSignInForAccountPicker: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  isSuccessResponse: (response: unknown) =>
    typeof response === 'object' && response !== null && 'data' in response,
  isErrorWithCode: () => false,
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
}));

function renderLoginScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <FamilyProvider>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </FamilyProvider>
    );
  });

  return tree;
}

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      data: { idToken: 'google-id-token' },
    });
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({
        user: { id: '1', email: 'a@b.com', name: 'Ana' },
        families: [{ id: 'f1', name: 'Família', role: 'Admin' }],
        isNewUser: false,
        familyCount: 1,
        accessToken: 'jwt',
      });
    });
  });

  it('renders Google sign-in CTA when configured', () => {
    const tree = renderLoginScreen();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Entrar com Google');
    expect(json).toContain('Ours');
    expect(json).toContain('Cuidado colaborativo entre irmãos');
    expect(json).toContain('Rotinas, metas e calendário');
  });

  it('does not show an error when Google returns no idToken', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      data: { idToken: null },
    });

    const tree = renderLoginScreen();
    const button = tree.root.find(
      (node) => node.props.accessibilityRole === 'button' && node.props.onPress
    );

    await act(async () => {
      await button.props.onPress();
    });

    expect(mockMutate).not.toHaveBeenCalled();
    expect(JSON.stringify(tree.toJSON())).not.toContain('Não foi possível entrar');
  });

  it('submits idToken and routes to home after successful login', async () => {
    const tree = renderLoginScreen();
    const button = tree.root.find(
      (node) => node.props.accessibilityRole === 'button' && node.props.onPress
    );

    await act(async () => {
      await button.props.onPress();
    });

    expect(prepareGoogleSignInForAccountPicker).toHaveBeenCalled();
    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith(
      { idToken: 'google-id-token' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(mockReplace).toHaveBeenCalledWith('/(app)');
  });
});
