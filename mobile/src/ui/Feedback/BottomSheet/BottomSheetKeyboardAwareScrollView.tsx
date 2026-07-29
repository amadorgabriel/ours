import {
  SCROLLABLE_TYPE,
  createBottomSheetScrollableComponent,
  type BottomSheetScrollViewMethods,
  type BottomSheetScrollableProps,
} from '@gorhom/bottom-sheet';
import { memo } from 'react';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';
import Reanimated from 'react-native-reanimated';

const AnimatedKeyboardAwareScrollView = Reanimated.createAnimatedComponent(
  KeyboardAwareScrollView
);

const BottomSheetKeyboardAwareScrollViewComponent = createBottomSheetScrollableComponent<
  BottomSheetScrollViewMethods,
  BottomSheetScrollableProps & KeyboardAwareScrollViewProps
>(SCROLLABLE_TYPE.SCROLLVIEW, AnimatedKeyboardAwareScrollView);

export const BottomSheetKeyboardAwareScrollView = memo(
  BottomSheetKeyboardAwareScrollViewComponent
);

BottomSheetKeyboardAwareScrollView.displayName = 'BottomSheetKeyboardAwareScrollView';
