import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

import { t } from '@/core/infra/i18n';
import { ConfirmDialog, type ConfirmDialogButton } from '@/ui/Feedback/ConfirmDialog';

type AlertRequest = {
  title: string;
  message?: string;
  buttons?: ConfirmDialogButton[];
};

type AlertContextValue = {
  alert: (title: string, message?: string, buttons?: ConfirmDialogButton[]) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<AlertRequest[]>([]);
  const currentRef = useRef<AlertRequest | null>(null);
  const [current, setCurrent] = useState<AlertRequest | null>(null);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    currentRef.current = next;
    setCurrent(next);
  }, []);

  const alert = useCallback(
    (title: string, message?: string, buttons?: ConfirmDialogButton[]) => {
      const request: AlertRequest = {
        title,
        message,
        buttons: buttons ?? [{ text: t('common.ok') }],
      };

      if (!currentRef.current) {
        currentRef.current = request;
        setCurrent(request);
        return;
      }

      queueRef.current.push(request);
    },
    []
  );

  function handleClose() {
    currentRef.current = null;
    setCurrent(null);
    showNext();
  }

  const buttons =
    current?.buttons?.map((button) => ({
      ...button,
      onPress: () => {
        button.onPress?.();
      },
    })) ?? [];

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <ConfirmDialog
        visible={current !== null}
        title={current?.title ?? ''}
        message={current?.message}
        buttons={buttons}
        onRequestClose={handleClose}
      />
    </AlertContext.Provider>
  );
}

export function useAppAlert(): AlertContextValue {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAppAlert must be used within AlertProvider');
  }

  return context;
}
