import { Text, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { ParentDetailSheet } from '../index';

function getAllText(tree: renderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const { children } = node.props;
      return typeof children === 'string' ? children : '';
    })
    .join(' ');
}

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
    isRefetching: false,
    refetch: jest.fn(),
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
    const text = getAllText(tree);

    expect(text).toContain('João');
    expect(text).toContain('Informações médicas');
    expect(text).toContain('Alergia a dipirona');
    expect(text).toContain('Briefing de emergência');
    expect(text).toContain('Ligar Maria');
    expect(text).not.toContain('Editar');
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
    const text = getAllText(tree);

    expect(text).toContain('Editar');
  });

  it('shows empty states when fields are missing (MS-53)', () => {
    const tree = renderSheet({
      parent: {
        id: 'p1',
        name: 'João',
        relationship: 'Pai',
      },
    });
    const text = getAllText(tree);

    expect(text).toContain('Nenhuma informação médica cadastrada ainda.');
    expect(text).toContain('Nenhum briefing de emergência cadastrado ainda.');
  });

  it('enters edit mode with text inputs for admin (MS-190)', () => {
    const tree = renderSheet({
      isAdmin: true,
      parent: {
        id: 'p1',
        name: 'Maria',
        relationship: 'Mãe',
        medicalInfo: 'Hipertensão',
        emergencyBriefing: 'Ligar filho',
      },
    });

    const editButton = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Editar ficha'
    );

    act(() => {
      editButton.props.onPress();
    });

    expect(tree.root.findAllByType(TextInput)).toHaveLength(2);
    expect(getAllText(tree)).toContain('Cancelar');
  });

  it('preserves edit mode when parent refetches (MS-190)', () => {
    const parent = {
      id: 'p1',
      name: 'Maria',
      relationship: 'Mãe',
      medicalInfo: 'Hipertensão',
      emergencyBriefing: 'Ligar filho',
    };

    useParent.mockReturnValue({
      data: parent,
      isLoading: false,
      isError: false,
      isRefetching: false,
      refetch: jest.fn(),
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
        <ParentDetailSheet parentId="p1" visible isAdmin onClose={jest.fn()} />
      );
    });

    const editButton = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Editar ficha'
    );

    act(() => {
      editButton.props.onPress();
    });

    const medicalInput = tree.root.findAllByType(TextInput)[0];

    act(() => {
      medicalInput.props.onChangeText('Diabetes');
    });

    useParent.mockReturnValue({
      data: { ...parent, medicalInfo: 'Hipertensão' },
      isLoading: false,
      isError: false,
      isRefetching: true,
      refetch: jest.fn(),
    });

    act(() => {
      tree.update(<ParentDetailSheet parentId="p1" visible isAdmin onClose={jest.fn()} />);
    });

    expect(tree.root.findAllByType(TextInput)).toHaveLength(2);
    expect(tree.root.findAllByType(TextInput)[0].props.value).toBe('Diabetes');
    expect(getAllText(tree)).toContain('Cancelar');
  });
});
