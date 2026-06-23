import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import renderer, { act } from 'react-test-renderer';

import { useCreateFamily } from '../index.hooks';

const mockSetFamilyId = jest.fn();
const mockSetSession = jest.fn();
const mockCreate = jest.fn();
const mockGetSession = jest.fn();

jest.mock('@/core/infra/http/http-client-factory', () => ({
  HttpClientFactory: {
    create: () => ({ request: jest.fn() }),
  },
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({ setSession: mockSetSession }),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: () => ({ setFamilyId: mockSetFamilyId }),
}));

jest.mock('../create-family.usecase', () => ({
  CreateFamilyUseCase: jest.fn().mockImplementation(() => ({
    create: mockCreate,
  })),
}));

jest.mock('../../auth/get-session.usecase', () => ({
  AuthGetSessionUseCase: jest.fn().mockImplementation(() => ({
    getSession: mockGetSession,
  })),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
}

function CreateFamilyRunner({
  onReady,
}: {
  onReady: (mutation: ReturnType<typeof useCreateFamily>) => void;
}) {
  const mutation = useCreateFamily();

  useEffect(() => {
    onReady(mutation);
  }, [mutation, onReady]);

  return null;
}

describe('useCreateFamily', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets created family as active after refresh clears multi-family selection', async () => {
    mockCreate.mockResolvedValue({ id: 'new-family-id', name: 'Silva' });
    mockGetSession.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com', name: 'User' },
      families: [
        { id: 'family-old', name: 'Antiga', role: 'Admin' },
        { id: 'new-family-id', name: 'Silva', role: 'Admin' },
      ],
      isNewUser: false,
      familyCount: 2,
    });

    const client = createTestQueryClient();
    let mutation!: ReturnType<typeof useCreateFamily>;

    await act(async () => {
      renderer.create(
        <QueryClientProvider client={client}>
          <CreateFamilyRunner
            onReady={(value) => {
              mutation = value;
            }}
          />
        </QueryClientProvider>
      );
    });

    await act(async () => {
      await mutation.mutateAsync({ name: 'Silva' });
    });

    expect(mockSetFamilyId).toHaveBeenCalledWith(null);
    expect(mockSetFamilyId).toHaveBeenLastCalledWith('new-family-id');
    expect(mockSetSession).toHaveBeenCalled();
  });
});
