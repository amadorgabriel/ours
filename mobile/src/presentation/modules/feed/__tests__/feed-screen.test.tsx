import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { FeedScreen } from '../index';

const mockRefetch = jest.fn();

jest.mock('@/core/services/usecases/activity/index.hooks', () => ({
  useActivityFeed: () => ({
    data: { items: [], unreadCount: 0 },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: mockRefetch,
  }),
  useMarkActivitySeen: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

describe('FeedScreen', () => {
  it('shows empty state when there are no activities', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<FeedScreen />);
    });

    const emptyText = tree.root.findAll(
      (node) => node.type === Text && node.props.children === 'Nenhuma atividade ainda'
    );

    expect(emptyText.length).toBeGreaterThan(0);
  });
});
