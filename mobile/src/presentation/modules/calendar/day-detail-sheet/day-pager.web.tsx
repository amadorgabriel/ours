import { Children, type ReactNode, type Ref, forwardRef, useImperativeHandle } from 'react';

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
  { currentPageIndex, children }: DayPagerProps,
  ref: Ref<DayPagerRef>
) {
  useImperativeHandle(ref, () => ({
    setPageWithoutAnimation: () => undefined,
  }));

  const pages = Children.toArray(children);
  return pages[currentPageIndex] ?? null;
});
