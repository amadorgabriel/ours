import renderer, { act } from 'react-test-renderer';

import { AuthGuard } from '../auth-guard';
import { GuestGuard } from '../guest-guard';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/presentation/providers/auth';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('auth guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('AuthGuard redirects guests to login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isSessionLoading: false,
      session: null,
      setSession: jest.fn(),
      clearSession: jest.fn(),
      setIsSessionLoading: jest.fn(),
    });

    act(() => {
      renderer.create(
        <AuthGuard>
          <Capture />
        </AuthGuard>
      );
    });

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('AuthGuard renders children for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isSessionLoading: false,
      session: {
        user: { id: '1', email: 'a@b.com', name: 'Ana' },
        families: [],
        isNewUser: false,
        familyCount: 1,
      },
      setSession: jest.fn(),
      clearSession: jest.fn(),
      setIsSessionLoading: jest.fn(),
    });

    act(() => {
      renderer.create(
        <AuthGuard>
          <Capture />
        </AuthGuard>
      );
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('GuestGuard redirects authenticated users away from login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isSessionLoading: false,
      session: {
        user: { id: '1', email: 'a@b.com', name: 'Ana' },
        families: [],
        isNewUser: false,
        familyCount: 0,
      },
      setSession: jest.fn(),
      clearSession: jest.fn(),
      setIsSessionLoading: jest.fn(),
    });

    act(() => {
      renderer.create(
        <GuestGuard>
          <Capture />
        </GuestGuard>
      );
    });

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/onboarding');
  });
});

function Capture() {
  return null;
}
