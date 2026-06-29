import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  type RefreshControlProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/presentation/hooks/use-translation';
import { colors } from '@/presentation/styles/tokens';

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

export function BottomSheet({
  visible,
  onClose,
  children,
  accessibilityLabel,
  scrollable = false,
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
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.background}
      enableDynamicSizing
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      maxDynamicContentSize={maxDynamicContentSize}
      stackBehavior="push"
      onDismiss={handleDismiss}
    >
      {scrollable ? (
        <BottomSheetScrollView
          accessibilityLabel={panelLabel}
          accessible
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={contentPadding}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView accessibilityLabel={panelLabel} accessible style={contentPadding}>
          {children}
        </BottomSheetView>
      )}
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
});
