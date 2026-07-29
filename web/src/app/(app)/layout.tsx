import type { ReactNode } from 'react';

import { AppClientWrapper } from '@/presentation/modules/app-shell/app-client-wrapper';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppClientWrapper>{children}</AppClientWrapper>;
}
