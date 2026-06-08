import type { ReactNode } from 'react';
import '@/presentation/styles/globals.css';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
