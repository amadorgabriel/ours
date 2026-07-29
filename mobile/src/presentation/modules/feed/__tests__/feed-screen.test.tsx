import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import type { ActivityFeedItem } from '@/core/domain/activity';

import { FeedScreen } from '../index';

const mockRefetch = jest.fn();
const mockUseActivityFeed = jest.fn();

jest.mock('@/core/services/usecases/activity/index.hooks', () => ({
  useActivityFeed: () => mockUseActivityFeed(),
  useMarkActivitySeen: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({
    session: { user: { id: 'user-1' } },
  }),
}));

jest.mock('@/presentation/providers/register-activity', () => ({
  useRegisterActivity: () => ({
    openRegisterMenu: jest.fn(),
  }),
}));

jest.mock('@/presentation/modules/feed/activity-detail-sheet', () => ({
  ActivityDetailSheet: 'ActivityDetailSheet',
}));

function feedMock(items: ActivityFeedItem[]) {
  return {
    data: { items, unreadCount: 0 },
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: mockRefetch,
  };
}

describe('FeedScreen', () => {
  beforeEach(() => {
    mockRefetch.mockClear();
    mockUseActivityFeed.mockReturnValue(feedMock([]));
  });

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
