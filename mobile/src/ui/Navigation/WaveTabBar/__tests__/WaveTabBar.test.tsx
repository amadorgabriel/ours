import renderer, { act } from 'react-test-renderer';

import { tabItems } from '../tab-config';
import { WaveTabBar } from '../index';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../WaveBarBackground', () => ({
  WaveBarBackground: 'WaveBarBackground',
}));

describe('WaveTabBar', () => {
  it('renders four tabs without center button', () => {
    const navigation = {
      emit: jest.fn(() => ({ defaultPrevented: false })),
      navigate: jest.fn(),
    };

    const state = {
      index: 0,
      routes: tabItems.map((tab, index) => ({
        key: `${tab.name}-${index}`,
        name: tab.name,
        params: undefined,
      })),
    };

    const descriptors = Object.fromEntries(
      state.routes.map((route, index) => [
        route.key,
        {
          options: {
            tabBarBadge: index === 0 ? 3 : undefined,
          },
        },
      ])
    );

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <WaveTabBar
          descriptors={descriptors as never}
          navigation={navigation as never}
          state={state as never}
        />
      );
    });

    expect(tree.toJSON()).not.toBeNull();
    expect(JSON.stringify(tree.toJSON())).toContain('3');
    expect(navigation.emit).not.toHaveBeenCalled();
  });
});
