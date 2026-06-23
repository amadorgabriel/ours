import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { AppHeader } from '@/presentation/modules/app-shell/AppHeader';
import { InAppReminderBannerHost } from '@/presentation/modules/app-shell/InAppReminderBanner';
import { RegisterActivityFab } from '@/presentation/modules/app-shell/RegisterActivityFab';
import { TabPagerLayout } from '@/presentation/modules/app-shell/TabPager/TabPagerLayout';
import { FamilySelectGuard } from '@/presentation/modules/family/family-select-guard';
import { useActivityUnreadCount } from '@/core/services/usecases/activity/index.hooks';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';
import { WaveTabBar } from '@/ui/Navigation/WaveTabBar';

export default function AppTabsLayout() {
  const unreadCount = useActivityUnreadCount();
  const { t } = useTranslation();

  return (
    <FamilySelectGuard>
      <View className="flex-1 bg-cream">
        <AppHeader />
        <InAppReminderBannerHost />
        <View className="flex-1">
          <Tabs
            layout={({ state, navigation, descriptors }) => (
              <TabPagerLayout
                descriptors={descriptors}
                navigation={navigation}
                state={state}
              />
            )}
            screenOptions={{
              headerShown: false,
              sceneStyle: { backgroundColor: colors.bgCream },
            }}
            tabBar={(props) => <WaveTabBar {...props} />}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: t('tabs.activities'),
                tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
              }}
            />
            <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
            <Tabs.Screen name="goals" options={{ title: t('tabs.goals') }} />
            <Tabs.Screen name="profile" options={{ title: t('tabs.profile') }} />
          </Tabs>
          <RegisterActivityFab />
        </View>
      </View>
    </FamilySelectGuard>
  );
}
