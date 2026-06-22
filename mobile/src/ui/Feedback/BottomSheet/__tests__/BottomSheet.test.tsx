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
          <></>
        </BottomSheet>
      );
    });

    expect(tree.toJSON()).not.toBeNull();
  });

  it('renders nothing meaningful when hidden', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible={false} onClose={jest.fn()}>
          <></>
        </BottomSheet>
      );
    });

    expect(tree.toJSON()).toBeNull();
  });

  it('calls onClose when backdrop is pressed', () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={onClose} accessibilityLabel="Convite">
          <></>
        </BottomSheet>
      );
    });

    const backdrop = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Fechar' && node.props.onPress
    );

    act(() => {
      backdrop.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
