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

jest.mock('@/presentation/modules/feed/call-now-sheet', () => ({
  CallNowSheet: 'CallNowSheet',
}));

jest.mock('@/presentation/providers/notifications', () => ({
  useNotificationActions: jest.fn(() => ({
    callNowRequested: false,
    consumeCallNowRequest: jest.fn(),
  })),
}));

describe('WaveTabBar', () => {
  it('renders tab bar shell', () => {
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

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <WaveTabBar navigation={navigation as never} state={state as never} />
      );
    });

    expect(tree.toJSON()).not.toBeNull();
    expect(navigation.emit).not.toHaveBeenCalled();
  });
});
