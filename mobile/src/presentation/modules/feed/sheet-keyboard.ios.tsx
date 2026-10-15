import { scrollDismissesKeyboard } from '@expo/ui/swift-ui/modifiers';
import { Spacer } from '@expo/ui';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { SHEET_KEYBOARD_BOTTOM_OFFSET } from '@/ui/Feedback/BottomSheet/keyboard-sheet';

export function getSheetKeyboardModifiers() {
  return [];
}

export function getSheetScrollModifiers() {
  return [scrollDismissesKeyboard('interactively')];
}

export function SheetKeyboardInset() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const onShow = (event: { endCoordinates: { height: number } }) => {
      setHeight(event.endCoordinates.height + SHEET_KEYBOARD_BOTTOM_OFFSET);
    };
    const onHide = () => setHeight(0);
    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', onShow),
      Keyboard.addListener('keyboardDidShow', onShow),
      Keyboard.addListener('keyboardWillHide', onHide),
      Keyboard.addListener('keyboardDidHide', onHide),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, []);

  if (height === 0) {
    return null;
  }

  return <Spacer size={height} />;
}
