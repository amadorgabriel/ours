import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';

import { colors } from '@/presentation/styles/tokens';
import { useTranslation } from '@/presentation/hooks/use-translation';

import {
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
  const { t } = useTranslation();

  function renderTab(routeIndex: number) {
    const route = state.routes[routeIndex];
    const tab = tabItems[routeIndex];
    if (!route || !tab) return null;

    const isFocused = state.index === routeIndex;
    const iconName = (isFocused ? tab.activeIcon : tab.icon) as TabIconName;
    const label = t(tab.labelKey);
    const badge = descriptors[route.key]?.options?.tabBarBadge;
    const showBadge = typeof badge === 'number' ? badge > 0 : Boolean(badge);

    return (
      <Pressable
        key={route.key}
        accessibilityLabel={label}
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
        <View className="items-center">
          <View>
            <Ionicons
              color={isFocused ? colors.serenityGreen60 : colors.mindfulBrown60}
              name={iconName}
              size={isFocused ? 22 : 24}
            />
            {showBadge ? (
              <View className="absolute -right-2 -top-2 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1">
                <Text className="font-sans-semibold text-[10px] text-light">
                  {formatBadgeLabel(badge as string | number)}
                </Text>
              </View>
            ) : null}
          </View>
          <Text
            className={`mt-0.5 font-sans text-[10px] ${
              isFocused ? 'font-sans-semibold text-serenity-green' : 'text-mindful-brown/70'
            }`}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View
      className="bg-white"
      style={{
        paddingBottom: insets.bottom,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          },
          android: { elevation: 12 },
          default: {},
        }),
      }}
    >
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
