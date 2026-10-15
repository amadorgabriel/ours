jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(),
}));

jest.mock('expo-navigation-bar', () => ({
  setStyle: jest.fn(),
  NavigationBar: () => null,
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageTag: 'pt-BR' }],
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: unknown }) => children,
}));

jest.mock('@/presentation/providers/alert', () => ({
  AlertProvider: ({ children }: { children: unknown }) => children,
  useAppAlert: () => ({ alert: jest.fn() }),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
  };
});

jest.mock('@gorhom/bottom-sheet');

jest.mock('@expo/ui', () => require('./jest-expo-ui-mock'));

jest.mock('@expo/ui/swift-ui', () => require('./jest-expo-ui-swift-mock'));

jest.mock('@expo/ui/swift-ui/modifiers', () => ({
  background: () => ({}),
  frame: () => ({}),
  padding: () => ({}),
  presentationDetents: () => ({}),
  presentationDragIndicator: () => ({}),
  scrollDismissesKeyboard: () => ({}),
}));

jest.mock('react-native-keyboard-controller', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');

  return {
    KeyboardProvider: ({ children }: { children: unknown }) => children,
    KeyboardAvoidingView: ({ children }: { children: unknown }) => children,
    KeyboardAwareScrollView: ScrollView,
  };
});
