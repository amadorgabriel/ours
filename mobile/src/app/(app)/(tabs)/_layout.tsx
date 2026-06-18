import { Tabs } from 'expo-router';

import { FamilySelectGuard } from '@/presentation/modules/family/family-select-guard';
import { colors } from '@/presentation/styles/tokens';
import { WaveTabBar } from '@/ui/Navigation/WaveTabBar';

export default function AppTabsLayout() {
  return (
    <FamilySelectGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.bgCream },
        }}
        tabBar={(props) => <WaveTabBar {...props} />}
      >
        <Tabs.Screen name="index" options={{ title: 'Ligações' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendário' }} />
        <Tabs.Screen name="goals" options={{ title: 'Metas' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      </Tabs>
    </FamilySelectGuard>
  );
}
