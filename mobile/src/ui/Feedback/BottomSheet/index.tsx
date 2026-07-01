import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  type RefreshControlProps,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';

import { BottomSheetKeyboardAwareScrollView } from './BottomSheetKeyboardAwareScrollView';
import {
  SHEET_KEYBOARD_BOTTOM_OFFSET,
  SHEET_KEYBOARD_EXTRA_SPACE,
} from './keyboard-sheet';

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  accessibilityLabel?: string;
  scrollable?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  enablePanDownToClose?: boolean;
};

const MAX_SHEET_HEIGHT_RATIO = 0.9;
const ANDROID_KEYBOARD_INPUT_MODE = 'adjustPan' as const;

export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel,
  scrollable = true,
  refreshControl,
  enablePanDownToClose = true,
}: BottomSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [mounted, setMounted] = useState(visible);

  const maxDynamicContentSize = Dimensions.get('window').height * MAX_SHEET_HEIGHT_RATIO;

  const panelLabel = accessibilityLabel ?? t('bottomSheet.panel');
  const closeLabel = t('bottomSheet.close');

  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }

    if (mounted) {
      sheetRef.current?.dismiss();
    }
  }, [mounted, visible]);

  useEffect(() => {
    if (!visible || !mounted) {
      return;
    }

    sheetRef.current?.present();
  }, [mounted, visible]);

  useEffect(() => {
    return () => {
      sheetRef.current?.dismiss();
    };
  }, []);

  const handleDismiss = useCallback(() => {
    Keyboard.dismiss();
    setMounted(false);
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        accessibilityLabel={closeLabel}
        accessibilityRole="button"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    [closeLabel]
  );

  const contentPadding = {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: insets.bottom + 24,
  };

  if (!mounted) {
    return null;
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      accessibilityLabel={panelLabel}
      android_keyboardInputMode={
        Platform.OS === 'android' ? ANDROID_KEYBOARD_INPUT_MODE : 'adjustResize'
      }
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enableBlurKeyboardOnGesture={false}
      enableDynamicSizing
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      maxDynamicContentSize={maxDynamicContentSize}
      stackBehavior="push"
      onDismiss={handleDismiss}
    >
      <KeyboardAvoidingView
        automaticOffset
        behavior="padding"
        keyboardVerticalOffset={SHEET_KEYBOARD_BOTTOM_OFFSET}
        style={styles.keyboardAvoiding}
      >
        <BottomSheetKeyboardAwareScrollView
          accessibilityLabel={panelLabel}
          accessible
          bottomOffset={SHEET_KEYBOARD_BOTTOM_OFFSET}
          extraKeyboardSpace={SHEET_KEYBOARD_EXTRA_SPACE}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          scrollEnabled={scrollable}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={contentPadding}
        >
          {children}
        </BottomSheetKeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.bgCream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: `${colors.mindfulBrown60}33`,
  },
  keyboardAvoiding: {
    flex: 1,
  },
});
