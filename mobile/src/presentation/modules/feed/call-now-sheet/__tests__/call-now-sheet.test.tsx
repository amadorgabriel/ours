import renderer, { act } from 'react-test-renderer';

import { CallNowSheet } from '../index';

const mockMutate = jest.fn();
const mockReset = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/core/services/usecases/activity/index.hooks', () => ({
  useRegisterCall: () => ({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isError: false,
  }),
}));

jest.mock('@/presentation/providers/assistido', () => ({
  useAssistido: () => ({
    parentId: 'parent-1',
    activeParent: { id: 'parent-1', name: 'Pai', relationship: 'Pai' },
  }),
}));

describe('CallNowSheet', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockReset.mockClear();
  });

  it('submits call registration with active parent', () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<CallNowSheet visible onClose={onClose} />);
    });

    const registerButton = tree.root.find(
      (node) =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel === 'Registrar ligação'
    );

    act(() => {
      registerButton.props.onPress();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { parentId: 'parent-1', notes: undefined },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });
});
