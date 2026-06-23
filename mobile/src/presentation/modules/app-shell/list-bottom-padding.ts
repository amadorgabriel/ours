import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WAVE_TAB_BAR_HEIGHT } from '@/ui/Navigation/WaveTabBar';

export const FAB_SIZE = 56;
export const FAB_MARGIN = 16;
export const LIST_EXTRA_PADDING = 16;

export function useListBottomPadding(): number {
  const insets = useSafeAreaInsets();

  return (
    WAVE_TAB_BAR_HEIGHT + insets.bottom + FAB_SIZE + FAB_MARGIN + LIST_EXTRA_PADDING
  );
}
