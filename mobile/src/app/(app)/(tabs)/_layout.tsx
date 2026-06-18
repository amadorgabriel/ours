import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WaveTabBar, WAVE_TAB_BAR_HEIGHT, type WaveTabBarProps } from '@/ui/Navigation/WaveTabBar';

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();
  const scenePaddingBottom = WAVE_TAB_BAR_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#FCF8F4', paddingBottom: scenePaddingBottom },
      }}
      tabBar={(props) => (
        <WaveTabBar
          navigation={props.navigation as unknown as WaveTabBarProps['navigation']}
          state={props.state}
        />
      )}
    >
      <Tabs.Screen name="index" options={{ title: 'Ligações' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendário' }} />
      <Tabs.Screen name="goals" options={{ title: 'Metas' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
