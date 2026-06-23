import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';

import { CallNowSheet } from '@/presentation/modules/feed/call-now-sheet';
import { useNotificationActions } from '@/presentation/providers/notifications';
import { colors } from '@/presentation/styles/tokens';
import { WAVE_TAB_BAR_HEIGHT } from '@/ui/Navigation/WaveTabBar';

const FAB_SIZE = 56;
const FAB_MARGIN = 16;

export function RegisterActivityFab() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { callNowRequested, consumeCallNowRequest } = useNotificationActions();
  const [callNowVisible, setCallNowVisible] = useState(false);

  useEffect(() => {
    if (!callNowRequested) {
      return;
    }

    navigation.navigate('index' as never);
    setCallNowVisible(true);
    consumeCallNowRequest();
  }, [callNowRequested, consumeCallNowRequest, navigation]);

  return (
    <>
      <Pressable
        accessibilityLabel="Registrar atividade"
        accessibilityRole="button"
        className="absolute items-center justify-center rounded-full bg-serenity-green shadow-md"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          right: FAB_MARGIN,
          bottom: WAVE_TAB_BAR_HEIGHT + insets.bottom + FAB_MARGIN,
        }}
        onPress={() => setCallNowVisible(true)}
      >
        <Ionicons color={colors.textLight} name="add" size={28} />
      </Pressable>

      <CallNowSheet visible={callNowVisible} onClose={() => setCallNowVisible(false)} />
    </>
  );
}
