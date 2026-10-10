import type { ReactNode, Ref } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import PagerView from 'react-native-pager-view';

export type DayPagerRef = {
  setPageWithoutAnimation: (index: number) => void;
};

type DayPagerProps = {
  currentPageIndex: number;
  height: number;
  onPageSelected: (position: number) => void;
  children: ReactNode;
};

export const DayPager = forwardRef(function DayPager(
  { currentPageIndex, height, onPageSelected, children }: DayPagerProps,
  ref: Ref<DayPagerRef>
) {
  const pagerRef = useRef<PagerView>(null);

  useImperativeHandle(ref, () => ({
    setPageWithoutAnimation: (index: number) => {
      pagerRef.current?.setPageWithoutAnimation(index);
    },
  }));

  return (
    <PagerView
      ref={pagerRef}
      initialPage={currentPageIndex}
      style={{ height }}
      onPageSelected={(event) => {
        onPageSelected(event.nativeEvent.position);
      }}
    >
      {children}
    </PagerView>
  );
});
