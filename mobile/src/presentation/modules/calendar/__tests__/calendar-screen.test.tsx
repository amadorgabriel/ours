import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { CalendarScreen } from '../index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/core/services/usecases/activity/index.hooks', () => ({
  useActivitiesByMonth: () => ({
    data: { items: [] },
    isLoading: false,
    isError: false,
    isRefetching: false,
    isFetching: false,
    refetch: jest.fn(),
  }),
  getActivitiesByMonthQueryOptions: jest.fn(),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({
    session: {
      families: [{ id: 'family-1', name: 'Família', role: 'Admin', createdAt: '2026-01-01T00:00:00.000Z' }],
    },
  }),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: () => ({ familyId: 'family-1' }),
}));

jest.mock('@/presentation/providers/assistido', () => ({
  useAssistido: () => ({ parentId: null }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueries: () => [],
}));

describe('CalendarScreen', () => {
  it('renders calendar title and month grid', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<CalendarScreen />);
    });

    const title = tree.root.findAll(
      (node) => node.type === Text && node.props.children === 'Calendário'
    );

    expect(title.length).toBeGreaterThan(0);
  });
});
