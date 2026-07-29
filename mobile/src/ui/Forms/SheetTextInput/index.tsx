import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import type { ComponentProps } from 'react';

export type SheetTextInputProps = ComponentProps<typeof BottomSheetTextInput>;

export function SheetTextInput(props: SheetTextInputProps) {
  return <BottomSheetTextInput {...props} />;
}
