import renderer, { act } from 'react-test-renderer';

import {
  hydrateAuthTokenFromStorage,
  registerAuthTokenFromMemory,
  unregisterAuthTokenFromMemory,
  useSession,
} from '@/core/services/usecases/auth/index.hooks';

import type { AuthContextValue } from '../index.types';
import { AuthProvider, useAuth } from '../index';
import { SessionBootstrap } from '../session-bootstrap';

jest.mock('@/core/services/usecases/auth/index.hooks', () => ({
  hydrateAuthTokenFromStorage: jest.fn(),
  registerAuthTokenFromMemory: jest.fn(),
  unregisterAuthTokenFromMemory: jest.fn(),
  useSession: jest.fn(),
}));

const mockHydrate = hydrateAuthTokenFromStorage as jest.MockedFunction<
  typeof hydrateAuthTokenFromStorage
>;
const mockRegister = registerAuthTokenFromMemory as jest.MockedFunction<
  typeof registerAuthTokenFromMemory
>;
const mockUnregister = unregisterAuthTokenFromMemory as jest.MockedFunction<
  typeof unregisterAuthTokenFromMemory
>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('SessionBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHydrate.mockResolvedValue('stored-token');
    mockUseSession.mockReturnValue({
      isPending: true,
      isFetching: false,
    } as ReturnType<typeof useSession>);
  });

  it('registers token getter and hydrates storage on mount', async () => {
    let auth!: AuthContextValue;

    function Capture() {
      auth = useAuth();
      return null;
    }

    await act(async () => {
      renderer.create(
        <AuthProvider>
          <SessionBootstrap>
            <Capture />
          </SessionBootstrap>
        </AuthProvider>
      );
      await Promise.resolve();
    });

    expect(mockRegister).toHaveBeenCalled();
    expect(mockHydrate).toHaveBeenCalled();
    expect(mockUseSession).toHaveBeenCalledWith(true);
    expect(auth.isSessionLoading).toBe(true);
  });

  it('clears loading after token hydration and session fetch complete', async () => {
    let auth!: AuthContextValue;
    let tree!: renderer.ReactTestRenderer;

    function Capture() {
      auth = useAuth();
      return null;
    }

    mockUseSession.mockReturnValue({
      isPending: true,
      isFetching: false,
    } as ReturnType<typeof useSession>);

    await act(async () => {
      tree = renderer.create(
        <AuthProvider>
          <SessionBootstrap>
            <Capture />
          </SessionBootstrap>
        </AuthProvider>
      );
      await Promise.resolve();
    });

    mockUseSession.mockReturnValue({
      isPending: false,
      isFetching: false,
    } as ReturnType<typeof useSession>);

    await act(async () => {
      tree.update(
        <AuthProvider>
          <SessionBootstrap>
            <Capture />
          </SessionBootstrap>
        </AuthProvider>
      );
    });

    expect(auth.isSessionLoading).toBe(false);
  });

  it('unregisters token getter on unmount', async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(
        <AuthProvider>
          <SessionBootstrap>{null}</SessionBootstrap>
        </AuthProvider>
      );
      await Promise.resolve();
    });

    await act(async () => {
      tree.unmount();
    });

    expect(mockUnregister).toHaveBeenCalled();
  });
});
