import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';

import { colors } from '@/presentation/styles/tokens';
import { useNotificationActions } from '@/presentation/providers/notifications';

import { CallNowSheet } from '@/presentation/modules/feed/call-now-sheet';
import {
  ACTIVE_TAB_CIRCLE_SIZE,
  CENTER_BUTTON_OFFSET,
  CENTER_BUTTON_SIZE,
  tabItems,
  WAVE_TAB_BAR_HEIGHT,
} from './tab-config';
import { WaveBarBackground } from './WaveBarBackground';

type TabBarProps = Parameters<
  Extract<NonNullable<ComponentProps<typeof Tabs>['tabBar']>, (...args: never[]) => unknown>
>[0];

export type WaveTabBarProps = Pick<TabBarProps, 'state' | 'navigation'>;

type TabIconName = keyof typeof Ionicons.glyphMap;

const LEFT_TAB_INDEXES = [0, 1] as const;
const RIGHT_TAB_INDEXES = [2, 3] as const;

export function WaveTabBar({ state, navigation }: WaveTabBarProps) {
  const insets = useSafeAreaInsets();
  const { callNowRequested, consumeCallNowRequest } = useNotificationActions();
  const [callNowVisible, setCallNowVisible] = useState(false);

  useEffect(() => {
    if (!callNowRequested) {
      return;
    }

    navigation.navigate('index');
    setCallNowVisible(true);
    consumeCallNowRequest();
  }, [callNowRequested, consumeCallNowRequest, navigation]);

  function renderTab(routeIndex: number) {
    const route = state.routes[routeIndex];
    const tab = tabItems[routeIndex];
    if (!route || !tab) return null;

    const isFocused = state.index === routeIndex;
    const iconName = (isFocused ? tab.activeIcon : tab.icon) as TabIconName;

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
            <Ionicons color={colors.serenityGreen60} name={iconName} size={22} />
          </View>
        ) : (
          <View className="items-center">
            <Ionicons color={colors.mindfulBrown60} name={iconName} size={24} />
            <Text className="mt-0.5 font-sans text-[10px] text-mindful-brown/70">{tab.label}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <>
      <View
        className="bg-cream"
        style={{ paddingBottom: insets.bottom }}
      >
        <View style={{ height: WAVE_TAB_BAR_HEIGHT }}>
          <WaveBarBackground />
          <View className="absolute inset-0 flex-row items-center px-1">
            {LEFT_TAB_INDEXES.map(renderTab)}
            <View style={{ width: CENTER_BUTTON_SIZE }} />
            {RIGHT_TAB_INDEXES.map(renderTab)}
          </View>
        </View>

        <Pressable
          accessibilityLabel="Registrar ligação"
          accessibilityRole="button"
          className="absolute items-center justify-center rounded-full bg-serenity-green"
          style={{
            width: CENTER_BUTTON_SIZE,
            height: CENTER_BUTTON_SIZE,
            left: '50%',
            marginLeft: -CENTER_BUTTON_SIZE / 2,
            top: CENTER_BUTTON_OFFSET,
          }}
          onPress={() => setCallNowVisible(true)}
        >
          <Ionicons color={colors.textLight} name="add" size={28} />
        </Pressable>
      </View>

      <CallNowSheet visible={callNowVisible} onClose={() => setCallNowVisible(false)} />
    </>
  );
}

export {
  ACTIVE_TAB_CIRCLE_SIZE,
  CENTER_BUTTON_OFFSET,
  CENTER_BUTTON_SIZE,
  tabItems,
  WAVE_TAB_BAR_HEIGHT,
} from './tab-config';
