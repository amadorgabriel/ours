import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import renderer, { act } from 'react-test-renderer';

import type { ParentSummary } from '@/core/domain/parent';
import {
  clearStoredParentId,
  getStoredParentId,
  setStoredParentId,
} from '@/core/infra/storage/assistido-storage';

import { FamilyProvider, useFamily } from '../../family';
import type { AssistidoContextValue } from '../index.types';
import { AssistidoProvider, useAssistido } from '../index';

jest.mock('@/core/infra/storage/assistido-storage', () => ({
  getStoredParentId: jest.fn(),
  setStoredParentId: jest.fn(),
  clearStoredParentId: jest.fn(),
}));

jest.mock('@/core/services/usecases/parent/index.hooks', () => ({
  useParents: jest.fn(),
}));

const mockGetStoredParentId = getStoredParentId as jest.MockedFunction<typeof getStoredParentId>;
const mockSetStoredParentId = setStoredParentId as jest.MockedFunction<typeof setStoredParentId>;
const mockClearStoredParentId = clearStoredParentId as jest.MockedFunction<
  typeof clearStoredParentId
>;
const { useParents } = jest.requireMock('@/core/services/usecases/parent/index.hooks');

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function FamilyScope({
  familyId,
  children,
}: {
  familyId: string;
  children: ReactNode;
}) {
  const { setFamilyId } = useFamily();

  useEffect(() => {
    setFamilyId(familyId);
  }, [familyId, setFamilyId]);

  return children;
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
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
          <AssistidoProvider>
            <FamilyScope familyId={familyId}>
              <Capture />
            </FamilyScope>
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
    mockGetStoredParentId.mockResolvedValue(null);
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
    mockGetStoredParentId.mockResolvedValue('parent-1');

    const { getAssistido } = await renderAssistido('family-1');

    expect(mockGetStoredParentId).toHaveBeenCalledWith('family-1');
    expect(getAssistido().parentId).toBe('parent-1');
  });

  it('persists parent id when setParentId is called', async () => {
    const { getAssistido } = await renderAssistido('family-1');

    act(() => {
      getAssistido().setParentId('parent-2');
    });

    await flushEffects();

    expect(mockSetStoredParentId).toHaveBeenCalledWith('family-1', 'parent-2');
    expect(getAssistido().parentId).toBe('parent-2');
  });

  it('clears invalid parent id when parents list does not contain it', async () => {
    const parents: ParentSummary[] = [
      { id: 'parent-valid', name: 'Maria', relationship: 'Mãe' },
    ];

    useParents.mockReturnValue({ data: parents, isLoading: false });
    mockGetStoredParentId.mockResolvedValue('parent-stale');

    const { getAssistido } = await renderAssistido('family-1');

    await flushEffects();

    expect(getAssistido().parentId).toBeNull();
    expect(mockClearStoredParentId).toHaveBeenCalledWith('family-1');
    expect(getAssistido().activeParent).toBeNull();
  });
});
