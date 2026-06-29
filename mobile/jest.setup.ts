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
