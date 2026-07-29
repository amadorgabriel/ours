import renderer, { act } from 'react-test-renderer';

import { TabPagerLayout } from '../TabPagerLayout';

jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');

  return React.forwardRef(function MockPagerView(
    { children, onPageSelected }: { children: React.ReactNode; onPageSelected?: (event: { nativeEvent: { position: number } }) => void },
    _ref: unknown
  ) {
    return (
      <View
        testID="tab-pager"
        onTouchEnd={() => onPageSelected?.({ nativeEvent: { position: 1 } })}
      >
        {children}
      </View>
    );
  });
});

describe('TabPagerLayout', () => {
  it('syncs pager navigation when page is selected', () => {
    const navigation = {
      navigate: jest.fn(),
    };

    const state = {
      index: 0,
      routes: [
        { key: 'index-0', name: 'index', params: undefined },
        { key: 'calendar-1', name: 'calendar', params: undefined },
      ],
    };

    const descriptors = {
      'index-0': { render: () => null },
      'calendar-1': { render: () => null },
    };

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <TabPagerLayout
          descriptors={descriptors as never}
          navigation={navigation as never}
          state={state as never}
        />
      );
    });

    const pager = tree.root.findByProps({ testID: 'tab-pager' });

    act(() => {
      pager.props.onTouchEnd();
    });

    expect(navigation.navigate).toHaveBeenCalledWith('calendar', undefined);
  });
});
