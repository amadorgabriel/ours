import { Platform } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { BottomSheet } from '../index';
import {
  SHEET_KEYBOARD_BOTTOM_OFFSET,
  SHEET_KEYBOARD_EXTRA_SPACE,
} from '../keyboard-sheet';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('../BottomSheetKeyboardAwareScrollView', () => {
  const { ScrollView } = require('react-native');
  return { BottomSheetKeyboardAwareScrollView: ScrollView };
});

jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  return {
    KeyboardProvider: ({ children }: { children: React.ReactNode }) => children,
    KeyboardAvoidingView: ({ children }: { children: React.ReactNode }) => children,
    KeyboardAwareScrollView: ScrollView,
  };
});

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

  it('uses keyboard-aware scroll view with configurable offsets', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={jest.fn()}>
          <></>
        </BottomSheet>
      );
    });

    const scrollViews = tree.root.findAll(
      (node) => node.props.keyboardShouldPersistTaps === 'handled'
    );
    expect(scrollViews.length).toBeGreaterThan(0);
    expect(scrollViews[0]?.props.bottomOffset).toBe(SHEET_KEYBOARD_BOTTOM_OFFSET);
    expect(scrollViews[0]?.props.extraKeyboardSpace).toBe(SHEET_KEYBOARD_EXTRA_SPACE);
  });

  it('delegates keyboard handling to react-native-keyboard-controller', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <BottomSheet visible onClose={jest.fn()}>
          <></>
        </BottomSheet>
      );
    });

    const modal = tree.root.find((node) => node.props.keyboardBehavior === 'extend');
    expect(modal.props.keyboardBlurBehavior).toBe('none');
    expect(modal.props.enableBlurKeyboardOnGesture).toBe(false);
    expect(modal.props.android_keyboardInputMode).toBe(
      Platform.OS === 'android' ? 'adjustPan' : 'adjustResize'
    );
  });
});
