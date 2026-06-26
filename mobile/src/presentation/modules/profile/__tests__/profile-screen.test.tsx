import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { ProfileScreen } from '../index';

const mockReplace = jest.fn();
const mockMutateAsync = jest.fn();
const mockAlert = jest.fn();

function getAllText(tree: renderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const { children } = node.props;
      return typeof children === 'string' ? children : '';
    })
    .join(' ');
}

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/core/services/usecases/auth/index.hooks', () => ({
  useLogout: jest.fn(),
}));

jest.mock('@/core/services/usecases/family/index.hooks', () => ({
  useCreateInvite: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useUpdateFamily: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useDeleteFamily: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useCreateFamily: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useFamilyMembers: jest.fn(() => ({
    data: { items: [] },
    isLoading: false,
    isError: false,
  })),
  useRemoveFamilyMember: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

jest.mock('@/core/services/usecases/parent/index.hooks', () => ({
  useParents: jest.fn(),
  useParent: jest.fn(),
  useCreateParent: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useUpdateParent: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
  useUpdateParentPhoto: jest.fn(() => ({
    mutate: jest.fn(),
    reset: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
  })),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: jest.fn(),
}));

jest.mock('@/presentation/providers/alert', () => ({
  useAppAlert: () => ({ alert: mockAlert }),
}));

jest.mock('@/core/infra/notifications/notification-service', () => ({
  loadReminderSettings: jest.fn(() =>
    Promise.resolve({
      enabled: false,
      time: { hour: 9, minute: 0 },
      frequency: 'daily',
    })
  ),
  requestNotificationPermission: jest.fn(),
  getExpoPushToken: jest.fn(),
  getDevicePlatform: jest.fn(() => 'ios'),
  saveReminderSettings: jest.fn(),
}));

jest.mock('@/core/services/usecases/device/index.hooks', () => ({
  useRegisterDevice: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}));

const { useAuth } = jest.requireMock('@/presentation/providers/auth');
const { useFamily } = jest.requireMock('@/presentation/providers/family');
const { useLogout } = jest.requireMock('@/core/services/usecases/auth/index.hooks');
const { useParents, useParent } = jest.requireMock('@/core/services/usecases/parent/index.hooks');

function renderProfileScreen(options?: {
  role?: 'Admin' | 'Member';
  familyId?: string;
  parents?: Array<{ id: string; name: string; relationship: string }>;
}) {
  const role = options?.role ?? 'Admin';
  const familyId = options?.familyId ?? 'fam-1';

  useAuth.mockReturnValue({
    session: {
      user: { id: 'u1', email: 'ana@example.com', name: 'Ana Silva' },
      families: [{ id: 'fam-1', name: 'Família Silva', role }],
      familyCount: 1,
      isNewUser: false,
    },
  });

  useFamily.mockReturnValue({
    familyId,
    setFamilyId: jest.fn(),
  });

  useLogout.mockReturnValue({
    mutateAsync: mockMutateAsync.mockResolvedValue(undefined),
    isPending: false,
  });

  useParents.mockReturnValue({
    data: options?.parents ?? [],
    isLoading: false,
    isError: false,
    isRefetching: false,
    refetch: jest.fn(),
  });

  useParent.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
  });

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<ProfileScreen />);
  });

  return tree;
}

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows user name and email (MS-17)', () => {
    const tree = renderProfileScreen();
    const text = getAllText(tree);

    expect(text).toContain('Ana Silva');
    expect(text).toContain('ana@example.com');
  });

  it('shows active family name and role (MS-17)', () => {
    const tree = renderProfileScreen({ role: 'Admin' });
    const text = getAllText(tree);

    expect(text).toContain('Família Silva');
    expect(text).toContain('Administrador');
  });

  it('shows invite CTA for Admin and opens InviteSheet (MS-17, M-FAM-04)', () => {
    const tree = renderProfileScreen({ role: 'Admin' });
    const inviteButton = tree.root.findByProps({
      accessibilityRole: 'button',
      accessibilityLabel: 'Convidar familiar',
    });

    act(() => {
      inviteButton.props.onPress();
    });

    const text = getAllText(tree);
    expect(text).toContain('Gerar código');
  });

  it('shows parents admin section with create CTA when list is empty (MS-50)', () => {
    const tree = renderProfileScreen({ role: 'Admin' });
    const text = getAllText(tree);

    expect(text).toContain('Assistidos');
    expect(text).toContain('Novo assistido');
    expect((text.match(/Novo assistido/g) ?? []).length).toBe(1);
  });

  it('shows parents admin section with create CTA when list has items', () => {
    const tree = renderProfileScreen({
      role: 'Admin',
      parents: [{ id: 'p1', name: 'João', relationship: 'Father' }],
    });
    const text = getAllText(tree);

    expect(text).toContain('Novo assistido');
    expect((text.match(/Novo assistido/g) ?? []).length).toBe(1);
  });

  it('shows parents section for Member with read access (MS-53)', () => {
    const tree = renderProfileScreen({ role: 'Member' });
    const text = getAllText(tree);

    expect(text).toContain('Assistidos');
    expect(text).not.toContain('Novo assistido');
  });

  it('shows members section and leave family CTA for Member (MS-17)', () => {
    const tree = renderProfileScreen({ role: 'Member' });
    const text = getAllText(tree);

    expect(text).toContain('Membros');
    expect(text).toContain('Sair da família');
    expect(text).not.toContain('Convidar familiar');
  });

  it('hides invite CTA for Member (MS-17)', () => {
    const tree = renderProfileScreen({ role: 'Member' });
    const text = getAllText(tree);

    expect(text).not.toContain('Convidar familiar');
  });

  it('calls logout and navigates to login', async () => {
    mockAlert.mockImplementation((_title, _message, buttons) => {
      const confirm = buttons?.find((button: { text: string }) => button.text === 'Sair');
      void confirm?.onPress?.();
    });

    const tree = renderProfileScreen();
    const logoutButton = tree.root.findByProps({ accessibilityLabel: 'Sair da conta' });

    await act(async () => {
      logoutButton.props.onPress();
    });

    expect(mockAlert).toHaveBeenCalled();
    expect(mockMutateAsync).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('renders logout button as destructive text without border (MS-132)', () => {
    const tree = renderProfileScreen();
    const logoutButton = tree.root.findByProps({ accessibilityLabel: 'Sair da conta' });
    const logoutLabel = logoutButton.findByType(Text);

    expect(logoutButton.props.className).not.toContain('border');
    expect(logoutLabel.props.className).toContain('text-red-600');
  });
});
