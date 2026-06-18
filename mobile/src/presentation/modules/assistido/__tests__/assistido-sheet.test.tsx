import renderer, { act } from 'react-test-renderer';

import type { ParentSummary } from '@/core/domain/parent';

import { AssistidoSheet } from '../index';

const mockSetParentId = jest.fn();
const mockOnClose = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/presentation/providers/assistido', () => ({
  useAssistido: jest.fn(),
}));

const { useAssistido } = jest.requireMock('@/presentation/providers/assistido');

function renderAssistidoSheet(
  overrides?: Partial<ReturnType<typeof useAssistido>>
) {
  useAssistido.mockReturnValue({
    parents: [],
    parentId: null,
    isLoading: false,
    setParentId: mockSetParentId,
    activeParent: null,
    ...overrides,
  });

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<AssistidoSheet visible onClose={mockOnClose} />);
  });

  return tree;
}

describe('AssistidoSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no parents are registered (M-FAM-05)', () => {
    const tree = renderAssistidoSheet();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Nenhum assistido cadastrado');
    expect(json).toContain('Assistido');
  });

  it('selects parent and closes sheet', () => {
    const parents: ParentSummary[] = [
      { id: 'p1', name: 'João', relationship: 'Pai' },
      { id: 'p2', name: 'Maria', relationship: 'Mãe' },
    ];

    const tree = renderAssistidoSheet({ parents, parentId: null });
    const selectMaria = tree.root.findByProps({ accessibilityLabel: 'Selecionar Maria' });

    act(() => {
      selectMaria.props.onPress();
    });

    expect(mockSetParentId).toHaveBeenCalledWith('p2');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('marks selected parent in list', () => {
    const parents: ParentSummary[] = [{ id: 'p1', name: 'João', relationship: 'Pai' }];

    const tree = renderAssistidoSheet({ parents, parentId: 'p1' });
    const item = tree.root.findByProps({ accessibilityLabel: 'Selecionar João' });

    expect(item.props.accessibilityState).toEqual({ selected: true });
  });
});
