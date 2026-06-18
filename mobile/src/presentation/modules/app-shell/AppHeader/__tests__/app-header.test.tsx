import renderer, { act } from 'react-test-renderer';

import type { ParentSummary } from '@/core/domain/parent';

import { AppHeader } from '../index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/presentation/providers/family', () => ({
  useFamily: jest.fn(),
}));

jest.mock('@/presentation/providers/assistido', () => ({
  useAssistido: jest.fn(),
}));

const { useAuth } = jest.requireMock('@/presentation/providers/auth');
const { useFamily } = jest.requireMock('@/presentation/providers/family');
const { useAssistido } = jest.requireMock('@/presentation/providers/assistido');

function renderAppHeader(
  overrides?: {
    session?: ReturnType<typeof useAuth>['session'];
    familyId?: string | null;
    activeParent?: ParentSummary | null;
  }
) {
  useAuth.mockReturnValue({
    session: overrides?.session ?? {
      user: { id: 'u1', email: 'a@b.com', name: 'Ana' },
      families: [{ id: 'fam-1', name: 'Família Silva', role: 'Admin' }],
      familyCount: 1,
      isNewUser: false,
    },
  });

  useFamily.mockReturnValue({
    familyId: overrides?.familyId ?? 'fam-1',
    setFamilyId: jest.fn(),
  });

  useAssistido.mockReturnValue({
    parentId: overrides?.activeParent?.id ?? null,
    activeParent: overrides?.activeParent ?? null,
    parents: [],
    isLoading: false,
    setParentId: jest.fn(),
  });

  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<AppHeader />);
  });

  return tree;
}

describe('AppHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows active family name from session (MS-14)', () => {
    const tree = renderAppHeader();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Família Silva');
  });

  it('shows Assistido placeholder when no active parent (M-FAM-05)', () => {
    const tree = renderAppHeader();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Assistido');
  });

  it('shows active parent name when selected', () => {
    const tree = renderAppHeader({
      activeParent: { id: 'p1', name: 'João', relationship: 'Pai' },
    });
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('João');
  });

  it('navigates to family select on family chip tap', () => {
    const tree = renderAppHeader();
    const familyChip = tree.root.findByProps({
      accessibilityLabel: 'Família ativa: Família Silva. Toque para trocar',
    });

    act(() => {
      familyChip.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith('/(app)/families/select');
  });

  it('opens AssistidoSheet on assistido chip tap', () => {
    const tree = renderAppHeader();
    const assistidoChip = tree.root.findByProps({
      accessibilityLabel: 'Assistido: Assistido. Toque para selecionar',
    });

    act(() => {
      assistidoChip.props.onPress();
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Escolha para quem você está cuidando agora.');
  });
});
