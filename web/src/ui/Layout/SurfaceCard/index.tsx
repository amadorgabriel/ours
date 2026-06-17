import type { ReactNode } from 'react';

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return <div className={`web-surface-card glass-light ${className ?? ''}`.trim()}>{children}</div>;
}
