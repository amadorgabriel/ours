import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import type { ActivityFeedItem } from '@/core/domain/activity';
import { canEditActivity } from '@/core/services/usecases/activity/activity-edit-window';
import { ActivityCard } from '@/ui/DataDisplay/ActivityCard';

function isFeedItemEditable(item: ActivityFeedItem, currentUserId: string | undefined): boolean {
  return (
    (item.type === 'Call' || item.type === 'Visit') &&
    canEditActivity(item.userId, currentUserId, item.createdAt)
  );
}

function renderFeedCard(item: ActivityFeedItem, currentUserId: string | undefined) {
  const editable = isFeedItemEditable(item, currentUserId);

  return (
    <ActivityCard
      editable={editable}
      item={item}
      onPress={editable ? jest.fn() : undefined}
    />
  );
}

describe('feed editable cards', () => {
  it('makes own recent call activity tappable for edit', () => {
    const recentCall: ActivityFeedItem = {
      id: 'act-1',
      type: 'Call',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      userName: 'Ana',
    };

    expect(isFeedItemEditable(recentCall, 'user-1')).toBe(true);

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(renderFeedCard(recentCall, 'user-1'));
    });

    const editableHint = tree.root.findAll(
      (node) =>
        node.type === Text &&
        node.props.children === 'Toque para editar ou excluir (até 24 h)'
    );

    expect(editableHint.length).toBe(1);
  });

  it('does not make another member activity tappable', () => {
    const otherMemberCall: ActivityFeedItem = {
      id: 'act-2',
      type: 'Call',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      userId: 'user-2',
      userName: 'Bruno',
    };

    expect(isFeedItemEditable(otherMemberCall, 'user-1')).toBe(false);

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(renderFeedCard(otherMemberCall, 'user-1'));
    });

    const editableHint = tree.root.findAll(
      (node) =>
        node.type === Text &&
        node.props.children === 'Toque para editar ou excluir (até 24 h)'
    );

    expect(editableHint.length).toBe(0);
  });

  it('does not make own activity tappable after 24 hours', () => {
    const oldCall: ActivityFeedItem = {
      id: 'act-3',
      type: 'Call',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      userName: 'Ana',
    };

    expect(isFeedItemEditable(oldCall, 'user-1')).toBe(false);

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(renderFeedCard(oldCall, 'user-1'));
    });

    const editableHint = tree.root.findAll(
      (node) =>
        node.type === Text &&
        node.props.children === 'Toque para editar ou excluir (até 24 h)'
    );

    expect(editableHint.length).toBe(0);
  });
});
