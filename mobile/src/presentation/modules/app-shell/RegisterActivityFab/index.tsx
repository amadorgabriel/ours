import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cubicBezier,
  Easing,
  FadeIn,
  FadeOut,
  FadeOutDown,
  ReduceMotion,
  useReducedMotion,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CallNowSheet } from '@/presentation/modules/feed/call-now-sheet';
import { VisitSheet } from '@/presentation/modules/feed/visit-sheet';
import { FAB_MARGIN, FAB_SIZE } from '@/presentation/modules/app-shell/list-bottom-padding';
import { useNotificationActions } from '@/presentation/providers/notifications';
import { useRegisterActivity } from '@/presentation/providers/register-activity';
import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';
import { WAVE_TAB_BAR_HEIGHT } from '@/ui/Navigation/WaveTabBar';

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
const ACTION_DURATION = 200;
const PRESS_DURATION = 120;

function cssTransform(transform: NonNullable<ViewStyle['transform']>, duration: number) {
  return {
    transform,
    transitionProperty: 'transform',
    transitionDuration: duration,
    transitionTimingFunction: CSS_EASE_OUT,
  } as unknown as AnimatedStyle<ViewStyle>;
}

type MaterialName = keyof typeof MaterialIcons.glyphMap;

function tapHaptic(kind: 'open' | 'choose') {
  if (process.env.EXPO_OS !== 'ios') {
    return;
  }

  if (kind === 'open') {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return;
  }

  void Haptics.selectionAsync();
}

function enterAction(delay: number) {
  return FadeIn.delay(delay)
    .duration(ACTION_DURATION)
    .easing(EASE_OUT)
    .reduceMotion(ReduceMotion.System)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 12 }, { scale: 0.95 }],
    });
}

function leaveAction() {
  return FadeOutDown.duration(160).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
}

function PlatformIcon({
  sf,
  material,
  color,
  size,
}: {
  sf: SFSymbol;
  material: MaterialName;
  color: string;
  size: number;
}) {
  if (process.env.EXPO_OS === 'ios') {
    return <SymbolView name={sf} tintColor={color} size={size} />;
  }

  return <MaterialIcons color={color} name={material} size={size} />;
}

function ScalePressable({
  children,
  style,
  ...props
}: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      {...props}
      pressRetentionOffset={12}
      onPressIn={(event) => {
        setPressed(true);
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        props.onPressOut?.(event);
      }}
    >
      <Animated.View
        style={[
          style,
          cssTransform([{ scale: pressed && !reducedMotion ? 0.97 : 1 }], reducedMotion ? 0 : PRESS_DURATION),
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function RegisterActivityFab() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const { callNowRequested, consumeCallNowRequest } = useNotificationActions();
  const { bindOpenHandler } = useRegisterActivity();
  const [menuVisible, setMenuVisible] = useState(false);
  const [callNowVisible, setCallNowVisible] = useState(false);
  const [visitVisible, setVisitVisible] = useState(false);

  useEffect(() => {
    return bindOpenHandler(() => setMenuVisible(true));
  }, [bindOpenHandler]);

  useEffect(() => {
    if (!callNowRequested) {
      return;
    }

    navigation.navigate('index' as never);
    setCallNowVisible(true);
    consumeCallNowRequest();
  }, [callNowRequested, consumeCallNowRequest, navigation]);

  function toggleMenu() {
    const next = !menuVisible;
    setMenuVisible(next);
    if (next) {
      tapHaptic('open');
    }
  }

  function openCallSheet() {
    tapHaptic('choose');
    setMenuVisible(false);
    setCallNowVisible(true);
  }

  function openVisitSheet() {
    tapHaptic('choose');
    setMenuVisible(false);
    setVisitVisible(true);
  }

  const showCloseGlyph = menuVisible && reducedMotion;

  return (
    <>
      {menuVisible ? (
        <Animated.View
          entering={FadeIn.duration(ACTION_DURATION).easing(EASE_OUT).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(160).easing(EASE_OUT).reduceMotion(ReduceMotion.System)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable
            accessibilityLabel={t('fab.close')}
            accessibilityRole="button"
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(45, 62, 38, 0.28)' }]}
            onPress={() => setMenuVisible(false)}
          />
        </Animated.View>
      ) : null}

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          right: FAB_MARGIN,
          bottom: WAVE_TAB_BAR_HEIGHT + insets.bottom + FAB_MARGIN,
          alignItems: 'flex-end',
          gap: 10,
        }}
      >
        {menuVisible ? (
          <>
            <Animated.View entering={enterAction(40)} exiting={leaveAction()}>
              <ScalePressable
                accessibilityLabel={t('fab.registerCall')}
                accessibilityRole="button"
                style={callPillStyle}
                onPress={openCallSheet}
              >
                <PlatformIcon color={colors.textLight} material="call" sf="phone.fill" size={20} />
                <Text className="font-sans-semibold text-base text-light">{t('fab.call')}</Text>
              </ScalePressable>
            </Animated.View>
            <Animated.View entering={enterAction(0)} exiting={leaveAction()}>
              <ScalePressable
                accessibilityLabel={t('fab.registerVisit')}
                accessibilityRole="button"
                style={visitPillStyle}
                onPress={openVisitSheet}
              >
                <PlatformIcon
                  color={colors.serenityGreen60}
                  material="directions-walk"
                  sf="figure.walk"
                  size={20}
                />
                <Text className="font-sans-semibold text-base text-serenity-green">
                  {t('fab.visit')}
                </Text>
              </ScalePressable>
            </Animated.View>
          </>
        ) : null}

        <ScalePressable
          accessibilityLabel={menuVisible ? t('fab.close') : t('fab.registerActivity')}
          accessibilityRole="button"
          accessibilityState={{ expanded: menuVisible }}
          style={fabStyle}
          onPress={toggleMenu}
        >
          <Animated.View
            style={cssTransform(
              [{ rotate: menuVisible && !reducedMotion ? '45deg' : '0deg' }],
              reducedMotion ? 0 : ACTION_DURATION,
            )}
          >
            <PlatformIcon
              color={colors.textLight}
              material={showCloseGlyph ? 'close' : 'add'}
              sf={showCloseGlyph ? 'xmark' : 'plus'}
              size={28}
            />
          </Animated.View>
        </ScalePressable>
      </View>

      <CallNowSheet visible={callNowVisible} onClose={() => setCallNowVisible(false)} />
      <VisitSheet visible={visitVisible} onClose={() => setVisitVisible(false)} />
    </>
  );
}

const pillBase = {
  minHeight: 44,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 16,
  borderRadius: 999,
  boxShadow: '0 4px 12px rgba(45, 62, 38, 0.16)',
} as const;

const callPillStyle = {
  ...pillBase,
  backgroundColor: colors.serenityGreen60,
} as const;

const visitPillStyle = {
  ...pillBase,
  backgroundColor: colors.bgCream,
  borderWidth: 1,
  borderColor: colors.serenityGreen60,
} as const;

const fabStyle = {
  width: FAB_SIZE,
  height: FAB_SIZE,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: FAB_SIZE / 2,
  backgroundColor: colors.serenityGreen60,
  boxShadow: '0 4px 12px rgba(45, 62, 38, 0.2)',
} as const;
