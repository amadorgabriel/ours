import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { FamilySelectScreen } from '../index';

const mockReplace = jest.fn();
const mockSetFamilyId = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/presentation/providers/family', () => ({
  ...jest.requireActual('@/presentation/providers/family'),
  useFamily: () => ({
    familyId: null,
    setFamilyId: mockSetFamilyId,
  }),
}));

jest.mock('@/presentation/providers/auth', () => ({
  useAuth: () => ({
    session: {
      user: { id: '1', email: 'a@b.com', name: 'Ana' },
      families: [
        { id: 'f1', name: 'Família A', role: 'Admin' },
        { id: 'f2', name: 'Família B', role: 'Member' },
      ],
      isNewUser: false,
      familyCount: 2,
    },
    isAuthenticated: true,
    isSessionLoading: false,
    setSession: jest.fn(),
    clearSession: jest.fn(),
    setIsSessionLoading: jest.fn(),
  }),
}));

const mockFamilies = [
  { id: 'f1', name: 'Família A', role: 'Admin' as const },
  { id: 'f2', name: 'Família B', role: 'Member' as const },
];

jest.mock('@/core/services/usecases/family/index.hooks', () => ({
  useMyFamilies: () => ({
    data: mockFamilies,
    isLoading: false,
    isError: false,
  }),
}));

function renderFamilySelectScreen() {
  let tree!: renderer.ReactTestRenderer;

  act(() => {
    tree = renderer.create(<FamilySelectScreen />);
  });

  return tree;
}

function findFamilyButton(tree: renderer.ReactTestRenderer, familyName: string) {
  const buttons = tree.root.findAll(
    (node) => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function'
  );

  const match = buttons.find((button) =>
    button.findAllByType(Text).some((node) => node.props.children === familyName)
  );

  if (!match) {
    throw new Error(`Family button not found: ${familyName}`);
  }

  return match;
}

describe('FamilySelectScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders family list with names and roles (M-FAM-03)', () => {
    const tree = renderFamilySelectScreen();
    const json = JSON.stringify(tree.toJSON());

    expect(json).toContain('Escolha a família');
    expect(json).toContain('Família A');
    expect(json).toContain('Família B');
    expect(json).toContain('Administrador');
    expect(json).toContain('Membro');
  });

  it('sets active family and navigates home on select', () => {
    const tree = renderFamilySelectScreen();
    const familyButton = findFamilyButton(tree, 'Família B');

    act(() => {
      familyButton.props.onPress();
    });

    expect(mockSetFamilyId).toHaveBeenCalledWith('f2');
    expect(mockReplace).toHaveBeenCalledWith('/(app)');
  });
});
