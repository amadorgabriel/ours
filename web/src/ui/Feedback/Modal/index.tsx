'use client';

import { Modal as MantineModal, type ModalProps } from '@mantine/core';

export type { ModalProps };

const modalClassNames: Partial<Record<'body' | 'header' | 'title' | 'content' | 'close', string>> = {
  content: 'web-modal__content',
  header: 'web-modal__header',
  title: 'web-modal__title',
  body: 'web-modal__body',
  close: 'web-modal__close',
};

export function Modal({ overlayProps, ...props }: ModalProps) {
  return (
    <MantineModal
      centered
      overlayProps={{
        backgroundOpacity: 0.65,
        blur: 4,
        ...overlayProps,
      }}
      classNames={modalClassNames}
      {...props}
    />
  );
}
