import renderer, { act } from 'react-test-renderer';

import { CalendarGrid } from '../index';

describe('CalendarGrid', () => {
  it('renders month label and calls onDayPress', () => {
    const onDayPress = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <CalendarGrid
          year={2026}
          month={6}
          daysWithActivity={new Set([18])}
          onDayPress={onDayPress}
          onPrevMonth={jest.fn()}
          onNextMonth={jest.fn()}
        />
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Junho 2026');

    const dayButton = tree.root.find(
      (node) => node.props?.accessibilityLabel === 'Dia 18'
    );

    act(() => {
      dayButton.props.onPress();
    });

    expect(onDayPress).toHaveBeenCalledWith(18);
  });

  it('does not call onDayPress for disabled days', () => {
    const onDayPress = jest.fn();
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <CalendarGrid
          year={2026}
          month={6}
          daysWithActivity={new Set([5])}
          isDayDisabled={(day) => day < 10}
          onDayPress={onDayPress}
          onPrevMonth={jest.fn()}
          onNextMonth={jest.fn()}
        />
      );
    });

    const disabledDay = tree.root.findAll(
      (node) => node.props?.accessibilityState?.disabled === true
    );

    expect(disabledDay.length).toBeGreaterThan(0);
    expect(onDayPress).not.toHaveBeenCalled();
  });
});
