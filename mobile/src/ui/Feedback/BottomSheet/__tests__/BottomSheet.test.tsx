import { Platform } from 'react-native';
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

  it('renders nothing when hidden', () => {
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

  it('calls onClose when modal dismisses', () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={onClose} accessibilityLabel="Convite">
          <></>
        </BottomSheet>
      );
    });

    const modal = tree.root.find((node) => node.props.onDismiss);

    act(() => {
      modal.props.onDismiss();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses BottomSheetScrollView with keyboard-friendly props', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={jest.fn()}>
          <></>
        </BottomSheet>
      );
    });

    expect(
      tree.root.findAll((node) => node.props.keyboardShouldPersistTaps === 'handled').length
    ).toBeGreaterThan(0);
    const scrollViews = tree.root.findAll(
      (node) => node.props.keyboardShouldPersistTaps === 'handled'
    );
    expect(scrollViews[0]?.props.automaticallyAdjustKeyboardInsets).toBe(Platform.OS === 'ios');
  });

  it('uses extend keyboardBehavior on the modal', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={jest.fn()}>
          <></>
        </BottomSheet>
      );
    });

    const modal = tree.root.find((node) => node.props.keyboardBehavior === 'extend');
    expect(modal.props.android_keyboardInputMode).toBe('adjustResize');
  });
});
