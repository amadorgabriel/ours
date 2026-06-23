import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';

import { colors } from '@/presentation/styles/tokens';

import {
  ACTIVE_TAB_CIRCLE_SIZE,
  tabItems,
  WAVE_TAB_BAR_HEIGHT,
} from './tab-config';
import { WaveBarBackground } from './WaveBarBackground';

type TabBarProps = Parameters<
  Extract<NonNullable<ComponentProps<typeof Tabs>['tabBar']>, (...args: never[]) => unknown>
>[0];

export type WaveTabBarProps = Pick<TabBarProps, 'state' | 'navigation' | 'descriptors'>;

type TabIconName = keyof typeof Ionicons.glyphMap;

function formatBadgeLabel(badge: string | number): string {
  const count = typeof badge === 'number' ? badge : Number.parseInt(badge, 10);
  if (Number.isFinite(count) && count > 99) {
    return '99+';
  }

  return String(badge);
}

export function WaveTabBar({ state, navigation, descriptors }: WaveTabBarProps) {
  const insets = useSafeAreaInsets();

  function renderTab(routeIndex: number) {
    const route = state.routes[routeIndex];
    const tab = tabItems[routeIndex];
    if (!route || !tab) return null;

    const isFocused = state.index === routeIndex;
    const iconName = (isFocused ? tab.activeIcon : tab.icon) as TabIconName;
    const badge = descriptors[route.key]?.options?.tabBarBadge;
    const showBadge = typeof badge === 'number' ? badge > 0 : Boolean(badge);

    return (
      <Pressable
        key={route.key}
        accessibilityLabel={tab.label}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        className="min-h-[44px] min-w-[44px] flex-1 items-center justify-center"
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }}
      >
        {isFocused ? (
          <View
            className="items-center justify-center rounded-full bg-serenity-green/20"
            style={{ height: ACTIVE_TAB_CIRCLE_SIZE, width: ACTIVE_TAB_CIRCLE_SIZE }}
          >
            <View>
              <Ionicons color={colors.serenityGreen60} name={iconName} size={22} />
              {showBadge ? (
                <View className="absolute -right-2 -top-2 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1">
                  <Text className="font-sans-semibold text-[10px] text-light">
                    {formatBadgeLabel(badge as string | number)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View className="items-center">
            <View>
              <Ionicons color={colors.mindfulBrown60} name={iconName} size={24} />
              {showBadge ? (
                <View className="absolute -right-2 -top-1 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1">
                  <Text className="font-sans-semibold text-[10px] text-light">
                    {formatBadgeLabel(badge as string | number)}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text className="mt-0.5 font-sans text-[10px] text-mindful-brown/70">{tab.label}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <View className="bg-cream" style={{ paddingBottom: insets.bottom }}>
      <View style={{ height: WAVE_TAB_BAR_HEIGHT }}>
        <WaveBarBackground />
        <View className="absolute inset-0 flex-row items-center px-1">
          {tabItems.map((_, index) => renderTab(index))}
        </View>
      </View>
    </View>
  );
}

export { ACTIVE_TAB_CIRCLE_SIZE, tabItems, WAVE_TAB_BAR_HEIGHT } from './tab-config';
