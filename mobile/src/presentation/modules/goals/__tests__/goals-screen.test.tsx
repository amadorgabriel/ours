import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { GoalsScreen } from '../index';

const mockRefetch = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/core/services/usecases/goal/index.hooks', () => ({
  useGoals: () => ({
    data: { items: [] },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: mockRefetch,
  }),
  useCreateGoal: () => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useGoalContributions: () => ({
    data: { items: [] },
    isLoading: false,
    isRefetching: false,
    refetch: jest.fn(),
  }),
  useCreateGoalContribution: () => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useUpdateGoalContribution: () => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useDeleteGoalContribution: () => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
  useDeleteGoal: () => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({
    session: {
      user: { id: 'u1', name: 'Ana', email: 'a@b.com' },
      families: [{ id: 'f1', name: 'Família', role: 'Admin' }],
    },
  }),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: () => ({ familyId: 'f1' }),
}));

jest.mock('@/presentation/providers/assistido', () => ({
  useAssistido: () => ({ parentId: null, parents: [] }),
}));

describe('GoalsScreen', () => {
  it('shows empty state when there are no goals', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<GoalsScreen />);
    });

    const emptyText = tree.root.findAll(
      (node) => node.type === Text && node.props.children === 'Nenhuma meta ainda'
    );

    expect(emptyText.length).toBeGreaterThan(0);
  });

  it('shows empty state create goal button for admin', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<GoalsScreen />);
    });

    const createButton = tree.root.findAll(
      (node) =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === 'Criar meta'
    );

    expect(createButton.length).toBeGreaterThan(0);
  });
});
