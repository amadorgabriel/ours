import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import renderer, { act } from 'react-test-renderer';

import { useLogout } from '../index.hooks';

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    signOut: jest.fn(),
  },
}));

jest.mock('@/core/infra/http/http-client-factory', () => ({
  HttpClientFactory: {
    create: () => ({ request: jest.fn().mockResolvedValue({ statusCode: 200, data: null }) }),
  },
}));

jest.mock('@/core/infra/storage/auth-storage', () => ({
  clearStoredAuthToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/core/infra/storage/auth-token-memory', () => ({
  setInMemoryAuthToken: jest.fn(),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({ clearSession: jest.fn() }),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: () => ({ setFamilyId: jest.fn() }),
}));

const mockGoogleSignOut = GoogleSignin.signOut as jest.MockedFunction<typeof GoogleSignin.signOut>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
}

function LogoutRunner({ onReady }: { onReady: (logout: ReturnType<typeof useLogout>) => void }) {
  const logout = useLogout();

  useEffect(() => {
    onReady(logout);
  }, [logout, onReady]);

  return null;
}

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGoogleSignOut.mockResolvedValue(null);
  });

  it('calls GoogleSignin.signOut on successful logout', async () => {
    const client = createTestQueryClient();
    let logoutMutation!: ReturnType<typeof useLogout>;

    await act(async () => {
      renderer.create(
        <QueryClientProvider client={client}>
          <LogoutRunner
            onReady={(logout) => {
              logoutMutation = logout;
            }}
          />
        </QueryClientProvider>
      );
    });

    await act(async () => {
      await logoutMutation.mutateAsync();
    });

    expect(mockGoogleSignOut).toHaveBeenCalledTimes(1);
  });
});
