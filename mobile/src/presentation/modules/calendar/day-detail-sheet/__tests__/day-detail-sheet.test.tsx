import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { DayDetailSheet } from '../index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: () => ({ width: 390, height: 844, scale: 1, fontScale: 1 }),
}));

jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');

  return React.forwardRef(function MockPagerView(
    {
      children,
      onPageSelected,
    }: {
      children: React.ReactNode;
      onPageSelected?: (event: { nativeEvent: { position: number } }) => void;
    },
    _ref: unknown
  ) {
    return (
      <View
        testID="day-detail-pager"
        onTouchEnd={() => onPageSelected?.({ nativeEvent: { position: 2 } })}
      >
        {children}
      </View>
    );
  });
});

import type { ActivityFeedItem } from '@/core/domain/activity';

const baseDate = { year: 2026, month: 6, day: 18 };

describe('DayDetailSheet', () => {
  it('shows empty state when day has no activities', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <DayDetailSheet
          visible
          date={baseDate}
          items={[]}
          getItemsForDate={() => []}
          onClose={jest.fn()}
          onDateChange={jest.fn()}
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
          date={baseDate}
          items={items}
          getItemsForDate={() => items}
          onClose={jest.fn()}
          onDateChange={jest.fn()}
        />
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Ana');
  });

  it('calls onDateChange when pager navigates to next day', () => {
    const onDateChange = jest.fn();
    const familyCreatedAt = '2026-06-01T00:00:00.000Z';
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <DayDetailSheet
          visible
          date={baseDate}
          items={[]}
          familyCreatedAt={familyCreatedAt}
          getItemsForDate={() => []}
          onClose={jest.fn()}
          onDateChange={onDateChange}
        />
      );
    });

    const pagerView = tree.root.find((node) => node.props?.testID === 'day-detail-pager');

    act(() => {
      pagerView.props.onTouchEnd();
    });

    expect(onDateChange).toHaveBeenCalledWith({ year: 2026, month: 6, day: 19 });
  });
});
