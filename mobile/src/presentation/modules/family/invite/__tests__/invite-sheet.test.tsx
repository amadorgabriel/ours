import renderer, { act } from 'react-test-renderer';

import { HttpClientError } from '@/core/infra/http/http-error';

import { InviteSheet } from '../index';

const mockMutate = jest.fn();
const mockReset = jest.fn();

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/core/services/usecases/family/index.hooks', () => ({
  useCreateInvite: jest.fn(),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: jest.fn(() => ({ familyId: 'family-1' })),
}));

const { useCreateInvite } = jest.requireMock('@/core/services/usecases/family/index.hooks');
const { useFamily } = jest.requireMock('@/presentation/providers/family');

function renderInviteSheet(overrides?: Partial<ReturnType<typeof useCreateInvite>>) {
  useCreateInvite.mockReturnValue({
    mutate: mockMutate,
    reset: mockReset,
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  });

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<InviteSheet visible onClose={jest.fn()} />);
  });

  return tree;
}

describe('InviteSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFamily.mockReturnValue({ familyId: 'family-1' });
  });

  it('renders generate CTA when no invite yet (M-FAM-04)', () => {
    const tree = renderInviteSheet();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Convidar familiar');
    expect(json).toContain('Gerar código');
  });

  it('calls createInvite mutate when generate is pressed', () => {
    const tree = renderInviteSheet();
    const generateButton = tree.root.findByProps({ accessibilityLabel: 'Gerar código' });

    act(() => {
      generateButton.props.onPress();
    });

    expect(mockMutate).toHaveBeenCalledWith({}, expect.objectContaining({ onSuccess: expect.any(Function) }));
  });

  it('shows invite code after successful generation', () => {
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({
        inviteCode: 'XY12ZW',
        expiresAt: '2026-06-19T15:30:00.000Z',
      });
    });

    const tree = renderInviteSheet();
    const generateButton = tree.root.findByProps({ accessibilityLabel: 'Gerar código' });

    act(() => {
      generateButton.props.onPress();
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('XY12ZW');
    expect(json).toContain('Copiar');
    expect(json).toContain('Compartilhar');
  });

  it('shows admin error message on 403', () => {
    const tree = renderInviteSheet({
      isError: true,
      error: new HttpClientError('Forbidden', { statusCode: 403 }),
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Apenas administradores podem convidar.');
  });

  it('blocks generate when no active family is selected', () => {
    useFamily.mockReturnValue({ familyId: null });
    const tree = renderInviteSheet();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Selecione uma família ativa antes de gerar o convite.');
    expect(json).not.toContain('Gerar código');
  });
});
