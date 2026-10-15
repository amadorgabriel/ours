import { BottomSheet, Group, Host } from '@expo/ui/swift-ui';
import {
  background,
  frame,
  padding,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers';
import type { ReactNode } from 'react';

import { colors } from '@/presentation/styles/tokens';

type BrandedSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  children: ReactNode;
  testID?: string;
  modifiers?: unknown[];
};

export function BrandedSheet({ isPresented, onDismiss, children, testID }: BrandedSheetProps) {
  return (
    <Host
      colorScheme="light"
      pointerEvents="none"
      seedColor={colors.serenityGreen60}
      style={{ position: 'absolute' }}
    >
      <BottomSheet
        fitToContents={false}
        isPresented={isPresented}
        testID={testID}
        onIsPresentedChange={(presented) => {
          if (!presented) onDismiss();
        }}
      >
        <Group
          modifiers={[
            frame({ maxWidth: Infinity, alignment: 'topLeading' }),
            padding({ top: 16, leading: 16, trailing: 16 }),
            presentationDragIndicator('visible'),
            presentationDetents([{ fraction: 0.92 }]),
            background(colors.bgCream),
          ]}
        >
          {children}
        </Group>
      </BottomSheet>
    </Host>
  );
}
