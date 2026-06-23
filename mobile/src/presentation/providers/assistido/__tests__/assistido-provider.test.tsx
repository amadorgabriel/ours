import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLayoutEffect } from 'react';
import renderer, { act } from 'react-test-renderer';

import type { ParentSummary } from '@/core/domain/parent';
import * as assistidoStorage from '@/core/infra/storage/assistido-storage';

import { FamilyProvider, useFamily } from '../../family';
import type { AssistidoContextValue } from '../index.types';
import { AssistidoProvider, useAssistido } from '../index';

jest.mock('@/core/infra/storage/assistido-storage', () => ({
  getStoredAssistidoFilter: jest.fn(),
  getStoredParentId: jest.fn(),
  setStoredParentId: jest.fn(),
  setStoredAllAssistidos: jest.fn(),
  clearStoredParentId: jest.fn(),
}));

jest.mock('@/core/services/usecases/parent/index.hooks', () => ({
  useParents: jest.fn(),
}));

const mockGetStoredAssistidoFilter =
  assistidoStorage.getStoredAssistidoFilter as jest.MockedFunction<
    typeof assistidoStorage.getStoredAssistidoFilter
  >;
const mockSetStoredParentId =
  assistidoStorage.setStoredParentId as jest.MockedFunction<
    typeof assistidoStorage.setStoredParentId
  >;
const mockSetStoredAllAssistidos =
  assistidoStorage.setStoredAllAssistidos as jest.MockedFunction<
    typeof assistidoStorage.setStoredAllAssistidos
  >;
const mockClearStoredParentId =
  assistidoStorage.clearStoredParentId as jest.MockedFunction<
    typeof assistidoStorage.clearStoredParentId
  >;
const { useParents } = jest.requireMock('@/core/services/usecases/parent/index.hooks');

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function SetFamilyId({ familyId }: { familyId: string }) {
  const { setFamilyId } = useFamily();

  useLayoutEffect(() => {
    setFamilyId(familyId);
  }, [familyId, setFamilyId]);

  return null;
}

async function flushEffects() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}

async function waitForAssistido(
  getAssistido: () => AssistidoContextValue,
  predicate: (value: AssistidoContextValue) => boolean,
  attempts = 10
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (predicate(getAssistido())) return;
    await flushEffects();
  }
}

async function renderAssistido(
  familyId: string
): Promise<{ getAssistido: () => AssistidoContextValue }> {
  const client = createTestQueryClient();
  const holder: { current: AssistidoContextValue | null } = { current: null };

  function Capture() {
    holder.current = useAssistido();
    return null;
  }

  await act(async () => {
    renderer.create(
      <QueryClientProvider client={client}>
        <FamilyProvider>
          <SetFamilyId familyId={familyId} />
          <AssistidoProvider>
            <Capture />
          </AssistidoProvider>
        </FamilyProvider>
      </QueryClientProvider>
    );
  });

  await flushEffects();
  await flushEffects();

  return {
    getAssistido: () => {
      if (!holder.current) {
        throw new Error('Assistido context not ready');
      }
      return holder.current;
    },
  };
}

describe('AssistidoProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStoredAssistidoFilter.mockResolvedValue(null);
    useParents.mockReturnValue({ data: [], isLoading: false });
  });

  it('throws when useAssistido is used outside provider', () => {
    function Outside() {
      useAssistido();
      return null;
    }

    expect(() => {
      act(() => {
        renderer.create(<Outside />);
      });
    }).toThrow('useAssistido must be used within AssistidoProvider');
  });

  it('hydrates parent id from storage when family is set', async () => {
    mockGetStoredAssistidoFilter.mockResolvedValue('parent-1');
    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId
        ? [{ id: 'parent-1', name: 'João', relationship: 'Pai' }]
        : [],
      isLoading: false,
    }));

    const { getAssistido } = await renderAssistido('family-1');

    await waitForAssistido(getAssistido, (value) => value.parentId === 'parent-1');

    expect(mockGetStoredAssistidoFilter).toHaveBeenCalledWith('family-1');
    expect(getAssistido().parentId).toBe('parent-1');
  });

  it('persists parent id when setParentId is called', async () => {
    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId
        ? [{ id: 'parent-2', name: 'Maria', relationship: 'Mãe' }]
        : [],
      isLoading: false,
    }));

    const { getAssistido } = await renderAssistido('family-1');

    act(() => {
      getAssistido().setParentId('parent-2');
    });

    await flushEffects();

    expect(mockSetStoredParentId).toHaveBeenCalledWith('family-1', 'parent-2');
    expect(getAssistido().parentId).toBe('parent-2');
  });

  it('resets to Todos when stored parent is no longer in family', async () => {
    const parents: ParentSummary[] = [
      { id: 'parent-valid', name: 'Maria', relationship: 'Mãe' },
    ];

    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId ? parents : [],
      isLoading: false,
    }));
    mockGetStoredAssistidoFilter.mockResolvedValue('parent-stale');

    const { getAssistido } = await renderAssistido('family-1');

    await waitForAssistido(getAssistido, (value) => !value.isLoading && value.parentId === null);

    expect(mockSetStoredAllAssistidos).toHaveBeenCalledWith('family-1');
    expect(getAssistido().parentId).toBeNull();
    expect(mockSetStoredParentId).not.toHaveBeenCalled();
    expect(mockClearStoredParentId).not.toHaveBeenCalled();
    expect(getAssistido().activeParent).toBeNull();
  });

  it('defaults to Todos when none is stored', async () => {
    const parents: ParentSummary[] = [
      { id: 'parent-1', name: 'João', relationship: 'Pai' },
      { id: 'parent-2', name: 'Maria', relationship: 'Mãe' },
    ];

    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId ? parents : [],
      isLoading: false,
    }));

    const { getAssistido } = await renderAssistido('family-1');

    await waitForAssistido(getAssistido, (value) => !value.isLoading);

    expect(getAssistido().parentId).toBeNull();
    expect(mockSetStoredParentId).not.toHaveBeenCalled();
    expect(getAssistido().activeParent).toBeNull();
  });

  it('hydrates Todos from storage sentinel', async () => {
    mockGetStoredAssistidoFilter.mockResolvedValue('all');
    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId
        ? [{ id: 'parent-1', name: 'João', relationship: 'Pai' }]
        : [],
      isLoading: false,
    }));

    const { getAssistido } = await renderAssistido('family-1');

    await waitForAssistido(getAssistido, (value) => !value.isLoading);

    expect(getAssistido().parentId).toBeNull();
    expect(mockSetStoredAllAssistidos).not.toHaveBeenCalled();
  });

  it('persists Todos sentinel when setParentId is called with null', async () => {
    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId
        ? [{ id: 'parent-2', name: 'Maria', relationship: 'Mãe' }]
        : [],
      isLoading: false,
    }));

    const { getAssistido } = await renderAssistido('family-1');

    act(() => {
      getAssistido().setParentId(null);
    });

    await flushEffects();

    expect(mockSetStoredAllAssistidos).toHaveBeenCalledWith('family-1');
    expect(getAssistido().parentId).toBeNull();
  });

  it('is not loading when familyId is null', async () => {
    const client = createTestQueryClient();
    const holder: { current: AssistidoContextValue | null } = { current: null };

    function Capture() {
      holder.current = useAssistido();
      return null;
    }

    await act(async () => {
      renderer.create(
        <QueryClientProvider client={client}>
          <FamilyProvider>
            <AssistidoProvider>
              <Capture />
            </AssistidoProvider>
          </FamilyProvider>
        </QueryClientProvider>
      );
    });

    await flushEffects();

    expect(holder.current?.isLoading).toBe(false);
    expect(holder.current?.parentId).toBeNull();
  });

  it('clears parent id when parents list is empty', async () => {
    mockGetStoredAssistidoFilter.mockResolvedValue('parent-stale');
    useParents.mockImplementation((familyId: string | null) => ({
      data: familyId ? [] : [],
      isLoading: false,
    }));

    const { getAssistido } = await renderAssistido('family-1');

    await waitForAssistido(getAssistido, (value) => !value.isLoading);

    expect(mockClearStoredParentId).toHaveBeenCalledWith('family-1');
    expect(getAssistido().parentId).toBeNull();
  });
});
