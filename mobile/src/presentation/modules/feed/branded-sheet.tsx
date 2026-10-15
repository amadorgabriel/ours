import { BottomSheet } from '@expo/ui';
import type { ReactNode } from 'react';

type BrandedSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  children: ReactNode;
  testID?: string;
  modifiers?: unknown[];
};

export function BrandedSheet({
  isPresented,
  onDismiss,
  children,
  testID,
}: BrandedSheetProps) {
  return (
    <BottomSheet isPresented={isPresented} snapPoints={[{ fraction: 0.92 }]} testID={testID} onDismiss={onDismiss}>
      {children}
    </BottomSheet>
  );
}
