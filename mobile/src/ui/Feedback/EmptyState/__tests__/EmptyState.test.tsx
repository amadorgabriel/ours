import renderer, { act } from 'react-test-renderer';

import { EmptyState } from '../index';

describe('EmptyState', () => {
  it('renders title and description', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <EmptyState
          title="Nenhuma atividade ainda"
          description="Toque no botão central para registrar sua primeira ligação."
        />
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Nenhuma atividade ainda');
    expect(json).toContain('primeira ligação');
  });

  it('calls onAction when CTA is pressed', () => {
    const onAction = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <EmptyState title="Nenhuma meta" actionLabel="Nova meta" onAction={onAction} />
      );
    });

    const button = tree.root.findByProps({ accessibilityLabel: 'Nova meta' });

    act(() => {
      button.props.onPress();
    });

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
