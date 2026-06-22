import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';

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

export function TabPagerLayout({ state, navigation, descriptors }: TabPagerLayoutProps) {
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    pagerRef.current?.setPage(state.index);
  }, [state.index]);

  return (
    <View className="flex-1">
      <PagerView
        ref={pagerRef}
        initialPage={state.index}
        style={{ flex: 1 }}
        onPageSelected={(event) => {
          const nextIndex = event.nativeEvent.position;
          if (nextIndex === state.index) {
            return;
          }

          const route = state.routes[nextIndex];
          if (route) {
            navigation.navigate(route.name, route.params);
          }
        }}
      >
        {state.routes.map((route) => (
          <View key={route.key} className="flex-1">
            {descriptors[route.key]?.render()}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
