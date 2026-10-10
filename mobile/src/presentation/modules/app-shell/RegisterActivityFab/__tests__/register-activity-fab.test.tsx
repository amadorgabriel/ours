import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import { RegisterActivityFab } from '../index';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const animation = {
    delay: () => animation,
    duration: () => animation,
    easing: () => animation,
    reduceMotion: () => animation,
    withInitialValues: () => animation,
  };

  return {
    __esModule: true,
    default: { View },
    Easing: { bezier: () => (value: number) => value },
    cubicBezier: () => 'ease-out',
    FadeIn: animation,
    FadeOut: animation,
    FadeOutDown: animation,
    ReduceMotion: { System: 'system' },
    useReducedMotion: () => false,
  };
});

jest.mock('expo-router', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('@/presentation/providers/notifications', () => ({
  useNotificationActions: () => ({
    callNowRequested: false,
    consumeCallNowRequest: jest.fn(),
  }),
}));

jest.mock('@/presentation/providers/register-activity', () => ({
  useRegisterActivity: () => ({
    bindOpenHandler: () => () => {},
  }),
}));

jest.mock('@/presentation/modules/feed/call-now-sheet', () => {
  const { Text: MockText } = require('react-native');
  return {
    CallNowSheet: ({ visible }: { visible: boolean }) =>
      visible ? <MockText>call-sheet-open</MockText> : null,
  };
});

jest.mock('@/presentation/modules/feed/visit-sheet', () => {
  const { Text: MockText } = require('react-native');
  return {
    VisitSheet: ({ visible }: { visible: boolean }) =>
      visible ? <MockText>visit-sheet-open</MockText> : null,
  };
});

function press(tree: renderer.ReactTestRenderer, label: string) {
  const node = tree.root.find((candidate) => candidate.props.accessibilityLabel === label);
  act(() => {
    node.props.onPress();
  });
}

describe('RegisterActivityFab', () => {
  it('opens call and visit from the button instead of a sheet menu', () => {
    let tree!: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<RegisterActivityFab />);
    });

    expect(tree.root.findAll((node) => node.props.accessibilityLabel === 'Registrar ligação')).toHaveLength(0);

    press(tree, 'Registrar atividade');

    press(tree, 'Registrar ligação');
    expect(tree.root.findAllByType(Text).some((node) => node.props.children === 'call-sheet-open')).toBe(true);

    press(tree, 'Registrar atividade');
    press(tree, 'Registrar visita');
    expect(tree.root.findAllByType(Text).some((node) => node.props.children === 'visit-sheet-open')).toBe(true);
  });
});
