import renderer, { act } from 'react-test-renderer';
import { Share } from 'react-native';

import { HttpClientError } from '@/core/infra/http/http-error';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (component: unknown) => component },
    createAnimatedComponent: (component: unknown) => component,
  };
});

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
    expect(json).toContain('Por link');
  });

  it('calls createInvite mutate when generate is pressed', () => {
    const tree = renderInviteSheet();
    const generateButton = tree.root.findByProps({ accessibilityLabel: 'Por link' });

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
    const generateButton = tree.root.findByProps({ accessibilityLabel: 'Por link' });

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
    expect(json).not.toContain('Por link');
  });

  it('shows link and email options', () => {
    const tree = renderInviteSheet();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Convidar familiar');
    expect(json).toContain('Por link');
    expect(json).toContain('Por e-mail');
  });

  it('share message includes the join url and the code', async () => {
    process.env.EXPO_PUBLIC_INVITE_BASE_URL = 'https://exemplo.vercel.app';
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction, activityType: null });
    mockMutate.mockImplementation((_payload, options) => {
      options?.onSuccess?.({
        inviteCode: 'AB12CD',
        expiresAt: '2026-06-19T15:30:00.000Z',
      });
    });

    const tree = renderInviteSheet();

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Por link' }).props.onPress();
    });

    await act(async () => {
      tree.root.findByProps({ accessibilityLabel: 'Compartilhar' }).props.onPress();
    });

    expect(share).toHaveBeenCalledWith({
      message: expect.stringContaining('https://exemplo.vercel.app/join/AB12CD'),
    });
    expect(share.mock.calls[0]?.[0]?.message).toContain('AB12CD');
    share.mockRestore();
    delete process.env.EXPO_PUBLIC_INVITE_BASE_URL;
  });

  it('link option skips invitedEmail', () => {
    const tree = renderInviteSheet();

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Por link' }).props.onPress();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(mockMutate.mock.calls[0]?.[0]).not.toHaveProperty('invitedEmail');
  });

  it('email option posts ana@exemplo.com', () => {
    const tree = renderInviteSheet();

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Por e-mail' }).props.onPress();
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'E-mail do familiar' }).props.onChangeText('ana@exemplo.com');
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Enviar e-mail' }).props.onPress();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { invitedEmail: 'ana@exemplo.com' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('rejects an email without an at sign', () => {
    const tree = renderInviteSheet();

    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Por e-mail' }).props.onPress();
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'E-mail do familiar' }).props.onChangeText('sem-arroba');
    });
    act(() => {
      tree.root.findByProps({ accessibilityLabel: 'Enviar e-mail' }).props.onPress();
    });

    expect(JSON.stringify(tree.toJSON())).toContain('Informe um e-mail válido.');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('502 still shows the invite code', () => {
    const tree = renderInviteSheet({
      isError: true,
      error: new HttpClientError('Bad Gateway', {
        statusCode: 502,
        data: { inviteCode: 'AB12CD' },
      }),
    });

    expect(JSON.stringify(tree.toJSON())).toContain('AB12CD');
  });
});
