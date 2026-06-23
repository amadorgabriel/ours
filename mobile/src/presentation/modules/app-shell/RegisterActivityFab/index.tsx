import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';

import { CallNowSheet } from '@/presentation/modules/feed/call-now-sheet';
import { VisitSheet } from '@/presentation/modules/feed/visit-sheet';
import { FAB_MARGIN, FAB_SIZE } from '@/presentation/modules/app-shell/list-bottom-padding';
import { useNotificationActions } from '@/presentation/providers/notifications';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';
import { BottomSheet } from '@/ui/Feedback/BottomSheet';
import { WAVE_TAB_BAR_HEIGHT } from '@/ui/Navigation/WaveTabBar';

export function RegisterActivityFab() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { callNowRequested, consumeCallNowRequest } = useNotificationActions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [callNowVisible, setCallNowVisible] = useState(false);
  const [visitVisible, setVisitVisible] = useState(false);

  useEffect(() => {
    if (!callNowRequested) {
      return;
    }

    navigation.navigate('index' as never);
    setCallNowVisible(true);
    consumeCallNowRequest();
  }, [callNowRequested, consumeCallNowRequest, navigation]);

  function openCallSheet() {
    setMenuVisible(false);
    setCallNowVisible(true);
  }

  function openVisitSheet() {
    setMenuVisible(false);
    setVisitVisible(true);
  }

  return (
    <>
      <Pressable
        accessibilityLabel={t('fab.registerActivity')}
        accessibilityRole="button"
        className="absolute items-center justify-center rounded-full bg-serenity-green shadow-md"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          right: FAB_MARGIN,
          bottom: WAVE_TAB_BAR_HEIGHT + insets.bottom + FAB_MARGIN,
        }}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons color={colors.textLight} name="add" size={28} />
      </Pressable>

      <BottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        accessibilityLabel={t('fab.registerActivity')}
      >
        <Text className="font-sans-semibold text-xl text-mindful-brown">{t('fab.registerActivity')}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('fab.registerCall')}
          className="mt-6 items-center rounded-xl bg-serenity-green py-3"
          onPress={openCallSheet}
        >
          <Text className="font-sans-semibold text-light">{t('fab.call')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('fab.registerVisit')}
          className="mt-3 items-center rounded-xl border border-serenity-green py-3"
          onPress={openVisitSheet}
        >
          <Text className="font-sans-semibold text-serenity-green">{t('fab.visit')}</Text>
        </Pressable>
      </BottomSheet>

      <CallNowSheet visible={callNowVisible} onClose={() => setCallNowVisible(false)} />
      <VisitSheet visible={visitVisible} onClose={() => setVisitVisible(false)} />
    </>
  );
}
