import { imePadding } from '@expo/ui/jetpack-compose/modifiers';

export function getSheetKeyboardModifiers() {
  return [imePadding()];
}

export function getSheetScrollModifiers() {
  return [];
}

export function SheetKeyboardInset() {
  return null;
}
