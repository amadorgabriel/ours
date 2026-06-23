import renderer, { act } from 'react-test-renderer';

import type { ActivityFeedItem } from '@/core/domain/activity';

import { ActivityCard } from '../index';

describe('ActivityCard', () => {
  it('renders call activity with author and notes', () => {
    const item: ActivityFeedItem = {
      id: 'act-1',
      type: 'Call',
      createdAt: new Date().toISOString(),
      userId: 'user-1',
      userName: 'Ana',
      parentName: 'Pai',
      notes: 'Conversa tranquila',
    };

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<ActivityCard item={item} />);
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Ligação');
    expect(json).toContain('Ana');
    expect(json).toContain('Pai');
    expect(json).toContain('Conversa tranquila');
  });

  it('renders visit activity with photo', () => {
    const item: ActivityFeedItem = {
      id: 'act-2',
      type: 'Visit',
      createdAt: new Date().toISOString(),
      userId: 'user-1',
      userName: 'Ana',
      parentName: 'Pai',
      allDay: true,
      startAt: new Date().toISOString(),
      photoUrl: 'data:image/jpeg;base64,abc',
    };

    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<ActivityCard item={item} />);
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Visita');
    expect(json).toContain('Foto da visita');
  });
});
