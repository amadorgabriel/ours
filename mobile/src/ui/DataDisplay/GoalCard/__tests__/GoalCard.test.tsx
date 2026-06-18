import renderer, { act } from 'react-test-renderer';

import type { Goal } from '@/core/domain/goal';
import { GoalCard } from '../index';

const sampleGoal: Goal = {
  id: 'goal-1',
  title: 'Reserva emergência',
  targetAmount: 500,
  currentAmount: 250,
  status: 'Active',
  createdAt: '2026-06-18T12:00:00.000Z',
  createdBy: 'user-1',
};

describe('GoalCard', () => {
  it('renders title and progress label', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<GoalCard goal={sampleGoal} />);
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Reserva emergência');
    expect(json).toContain('concluído');
  });
});
