import type { ReactNode } from 'react';
import { View } from 'react-native';

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type TabPagerLayoutProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: { navigate: (name: string, params?: object) => void };
  descriptors: Record<string, { render: () => ReactNode }>;
};

export function TabPagerLayout({ state, descriptors }: TabPagerLayoutProps) {
  const route = state.routes[state.index];

  return <View className="flex-1">{route ? descriptors[route.key]?.render() : null}</View>;
}
