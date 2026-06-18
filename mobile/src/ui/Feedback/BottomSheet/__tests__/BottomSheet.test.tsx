import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { BottomSheet } from '../index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('BottomSheet', () => {
  it('renders children when visible', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={jest.fn()}>
          <Text>Sheet content</Text>
        </BottomSheet>
      );
    });

    expect(tree.root.findByProps({ children: 'Sheet content' })).toBeTruthy();
  });

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={onClose}>
          <Text>Sheet content</Text>
        </BottomSheet>
      );
    });

    const backdrop = tree.root.findByProps({ accessibilityLabel: 'Fechar' });

    act(() => {
      backdrop.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
