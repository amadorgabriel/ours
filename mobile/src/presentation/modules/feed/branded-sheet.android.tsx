import { Column, Host, ModalBottomSheet, type ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { background, padding, testID as testIDModifier, type ModifierConfig } from '@expo/ui/jetpack-compose/modifiers';
import { requireOptionalNativeModule } from 'expo-modules-core';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { colors } from '@/presentation/styles/tokens';

type BrandedSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  children: ReactNode;
  testID?: string;
  modifiers?: ModifierConfig[];
};

export function BrandedSheet({
  isPresented,
  onDismiss,
  children,
  testID,
  modifiers,
}: BrandedSheetProps) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const [mount, setMount] = useState(isPresented);

  useEffect(() => {
    if (!isPresented) {
      return;
    }

    void SystemUI.setBackgroundColorAsync(colors.bgCream).catch(() => undefined);
    // Native "dark" means dark icons on a light bar. The module is missing until a dev client rebuild.
    requireOptionalNativeModule<{ setStyle(style: 'light' | 'dark'): void }>(
      'ExpoNavigationBar',
    )?.setStyle('dark');
  }, [isPresented]);

  useEffect(() => {
    if (isPresented) {
      setMount(true);
      return;
    }

    let cancelled = false;
    sheetRef.current?.hide().then(() => {
      if (!cancelled) setMount(false);
    });

    return () => {
      cancelled = true;
    };
  }, [isPresented]);

  if (!mount) {
    return null;
  }

  const contentModifiers: ModifierConfig[] = [
    padding(16, 0, 16, 8),
    background(colors.bgCream),
  ];
  if (testID) {
    contentModifiers.push(testIDModifier(testID));
  }

  return (
    <Host
      colorScheme="light"
      pointerEvents="none"
      seedColor={colors.serenityGreen60}
      style={{ position: 'absolute' }}
    >
      <ModalBottomSheet
        ref={sheetRef}
        containerColor={colors.bgCream}
        contentColor={colors.mindfulBrown60}
        modifiers={modifiers}
        showDragHandle
        skipPartiallyExpanded
        onDismissRequest={onDismiss}
      >
        <Column modifiers={contentModifiers}>{children}</Column>
      </ModalBottomSheet>
    </Host>
  );
}
