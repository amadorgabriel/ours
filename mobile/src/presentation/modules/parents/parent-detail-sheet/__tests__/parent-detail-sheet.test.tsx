import renderer, { act } from 'react-test-renderer';

import { ParentDetailSheet } from '../index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/core/services/usecases/parent/index.hooks', () => ({
  useParent: jest.fn(),
  useUpdateParent: jest.fn(),
}));

const { useParent } = jest.requireMock('@/core/services/usecases/parent/index.hooks');
const { useUpdateParent } = jest.requireMock('@/core/services/usecases/parent/index.hooks');

function renderSheet(options?: {
  isAdmin?: boolean;
  parent?: {
    id: string;
    name: string;
    relationship: string;
    medicalInfo?: string;
    emergencyBriefing?: string;
  } | null;
  isLoading?: boolean;
  isError?: boolean;
}) {
  useParent.mockReturnValue({
    data: options?.parent ?? null,
    isLoading: options?.isLoading ?? false,
    isError: options?.isError ?? false,
  });

  useUpdateParent.mockReturnValue({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  });

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(
      <ParentDetailSheet
        parentId="p1"
        visible
        isAdmin={options?.isAdmin ?? false}
        onClose={jest.fn()}
      />
    );
  });

  return tree;
}

describe('ParentDetailSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows medical and emergency sections for member (MS-53)', () => {
    const tree = renderSheet({
      parent: {
        id: 'p1',
        name: 'João',
        relationship: 'Pai',
        medicalInfo: 'Alergia a dipirona',
        emergencyBriefing: 'Ligar Maria',
      },
    });
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('João');
    expect(json).toContain('Informações médicas');
    expect(json).toContain('Alergia a dipirona');
    expect(json).toContain('Briefing de emergência');
    expect(json).toContain('Ligar Maria');
    expect(json).not.toContain('Editar');
  });

  it('shows edit CTA for admin (MS-54)', () => {
    const tree = renderSheet({
      isAdmin: true,
      parent: {
        id: 'p1',
        name: 'Maria',
        relationship: 'Mãe',
      },
    });
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Editar');
  });

  it('shows empty states when fields are missing (MS-53)', () => {
    const tree = renderSheet({
      parent: {
        id: 'p1',
        name: 'João',
        relationship: 'Pai',
      },
    });
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Nenhuma informação médica cadastrada ainda.');
    expect(json).toContain('Nenhum briefing de emergência cadastrado ainda.');
  });
});
