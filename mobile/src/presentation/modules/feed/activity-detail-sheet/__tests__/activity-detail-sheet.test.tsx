import { Text, TextInput } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import type { ActivityFeedItem } from '@/core/domain/activity';

import { ActivityDetailSheet } from '../index';

const mockAlert = jest.fn();
const mockUpdateMutate = jest.fn();
const mockDeleteMutate = jest.fn();
const mockUpdateReset = jest.fn();
const mockDeleteReset = jest.fn();

jest.mock('@/presentation/providers/alert', () => ({
  useAppAlert: () => ({ alert: mockAlert }),
}));

jest.mock('@/core/services/usecases/activity/index.hooks', () => ({
  useUpdateActivity: () => ({
    mutate: mockUpdateMutate,
    reset: mockUpdateReset,
    isPending: false,
    isError: false,
  }),
  useDeleteActivity: () => ({
    mutate: mockDeleteMutate,
    reset: mockDeleteReset,
    isPending: false,
    isError: false,
  }),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

const callItem: ActivityFeedItem = {
  id: 'act-1',
  type: 'Call',
  createdAt: new Date().toISOString(),
  userId: 'user-1',
  userName: 'Ana',
  notes: 'Nota original',
};

describe('ActivityDetailSheet', () => {
  beforeEach(() => {
    mockAlert.mockClear();
    mockUpdateMutate.mockClear();
    mockDeleteMutate.mockClear();
    mockUpdateReset.mockClear();
    mockDeleteReset.mockClear();
  });

  it('shows edit and delete actions in view mode', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ActivityDetailSheet visible item={callItem} onClose={jest.fn()} />
      );
    });

    const editButton = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Editar atividade'
    );
    const deleteButton = tree.root.find(
      (node) => node.props.accessibilityLabel === 'Excluir atividade'
    );

    expect(editButton).toBeDefined();
    expect(deleteButton).toBeDefined();
  });

  it('saves updated call notes', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ActivityDetailSheet visible item={callItem} onClose={jest.fn()} />
      );
    });

    act(() => {
      tree.root
        .find((node) => node.props.accessibilityLabel === 'Editar atividade')
        .props.onPress();
    });

    const notesInput = tree.root.find(
      (node) => node.type === TextInput && node.props.accessibilityLabel === 'Notas da ligação'
    );

    act(() => {
      notesInput.props.onChangeText('Nota atualizada');
    });

    act(() => {
      tree.root
        .find((node) => node.props.accessibilityLabel === 'Salvar alterações')
        .props.onPress();
    });

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      {
        activityId: 'act-1',
        data: { notes: 'Nota atualizada' },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('opens delete confirmation before removing activity', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ActivityDetailSheet visible item={callItem} onClose={jest.fn()} />
      );
    });

    act(() => {
      tree.root
        .find((node) => node.props.accessibilityLabel === 'Excluir atividade')
        .props.onPress();
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'Excluir atividade?',
      'Esta ação não pode ser desfeita.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancelar' }),
        expect.objectContaining({ text: 'Excluir' }),
      ])
    );
  });

  it('renders original notes in view mode', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <ActivityDetailSheet visible item={callItem} onClose={jest.fn()} />
      );
    });

    const notesText = tree.root.findAll(
      (node) => node.type === Text && node.props.children === 'Nota original'
    );

    expect(notesText.length).toBeGreaterThan(0);
  });
});
