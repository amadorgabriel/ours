import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import type { ParentSummary } from '@/core/domain/parent';

import { AssistidoPickerField } from '../index';

jest.mock('@/ui/Feedback/BottomSheet', () => ({
  BottomSheet: 'BottomSheet',
}));

const helena: ParentSummary = { id: 'h', name: 'Helena Costa', relationship: 'Mãe' };
const paulo: ParentSummary = { id: 'p', name: 'Paulo Costa', relationship: 'Pai' };

describe('AssistidoPickerField inline', () => {
  it('selects an assistido in one tap', () => {
    const onChange = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AssistidoPickerField inline onChange={onChange} parents={[helena, paulo]} value="h" />
      );
    });

    const pauloButton = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Selecionar Paulo Costa'
    );

    act(() => {
      pauloButton.props.onPress();
    });

    expect(onChange).toHaveBeenCalledWith('p');
  });

  it('shows the only assistido without a chooser', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AssistidoPickerField inline onChange={jest.fn()} parents={[helena]} value="h" />
      );
    });

    const labels = tree.root.findAllByType(Text).map((node) => node.props.children);

    expect(labels).toContain('Helena Costa');
    expect(
      tree.root.findAll((node) => node.props.accessibilityLabel === 'Selecionar Helena Costa')
    ).toHaveLength(0);
  });
});
