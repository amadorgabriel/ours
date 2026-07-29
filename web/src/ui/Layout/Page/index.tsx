import type { ReactNode } from 'react';

import { Container, type ContainerProps } from '@mantine/core';

type PageProps = {
  children: ReactNode;
  header?: ReactNode;
  size?: ContainerProps['size'];
  className?: string;
};

export function Page({ children, header, size = 'lg', className }: PageProps) {
  return (
    <div className="web-page">
      <Container size={size} className={`web-page__inner ${className ?? ''}`.trim()}>
        {header && <header className="web-page__header">{header}</header>}
        {children}
      </Container>
    </div>
  );
}
