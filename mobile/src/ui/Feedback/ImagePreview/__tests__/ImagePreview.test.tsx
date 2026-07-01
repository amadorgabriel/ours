import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { ImagePreview } from '../index';

jest.mock('expo-image', () => {
  const { View } = require('react-native');

  return {
    Image: View,
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('ImagePreview', () => {
  it('renders close button when visible', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ImagePreview visible uri="https://example.com/photo.jpg" onClose={jest.fn()} />
      );
    });

    const closeButtons = tree.root.findAllByProps({ accessibilityLabel: 'Fechar visualização' });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ImagePreview visible uri="https://example.com/photo.jpg" onClose={onClose} />
      );
    });

    const closeButtons = tree.root.findAllByProps({ accessibilityLabel: 'Fechar visualização' });
    const closeButton = closeButtons[0];

    act(() => {
      closeButton.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when uri is empty', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<ImagePreview visible uri="" onClose={jest.fn()} />);
    });

    expect(tree.toJSON()).toBeNull();
  });
});
