import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { DayDetailSheet } from '../index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

import type { ActivityFeedItem } from '@/core/domain/activity';

describe('DayDetailSheet', () => {
  it('shows empty state when day has no activities', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <DayDetailSheet
          visible
          dateLabel="18 de junho de 2026"
          items={[]}
          onClose={jest.fn()}
        />
      );
    });

    const emptyText = tree.root.findAll(
      (node) =>
        node.type === Text && node.props.children === 'Nenhuma atividade neste dia.'
    );

    expect(emptyText.length).toBeGreaterThan(0);
  });

  it('renders activity cards when day has items', () => {
    const items: ActivityFeedItem[] = [
      {
        id: 'act-1',
        type: 'Call',
        createdAt: '2026-06-18T12:00:00.000Z',
        userId: 'user-1',
        userName: 'Ana',
      },
    ];

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <DayDetailSheet
          visible
          dateLabel="18 de junho de 2026"
          items={items}
          onClose={jest.fn()}
        />
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Ana');
  });
});
