import renderer, { act } from 'react-test-renderer';

import { QueryErrorState } from '../index';

describe('QueryErrorState', () => {
  it('renders message and retry button', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <QueryErrorState message="Falha ao carregar" onRetry={jest.fn()} />
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Falha ao carregar');
    expect(json).toContain('Tentar novamente');
  });

  it('calls onRetry when button is pressed', () => {
    const onRetry = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<QueryErrorState onRetry={onRetry} />);
    });

    const button = tree.root.findByProps({ accessibilityLabel: 'Tentar novamente' });

    act(() => {
      button.props.onPress();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
