import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

type RegisterActivityContextValue = {
  openRegisterMenu: () => void;
  bindOpenHandler: (handler: () => void) => () => void;
};

const RegisterActivityContext = createContext<RegisterActivityContextValue | null>(null);

export function RegisterActivityProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<(() => void) | null>(null);

  const bindOpenHandler = useCallback((handler: () => void) => {
    handlerRef.current = handler;
    return () => {
      if (handlerRef.current === handler) {
        handlerRef.current = null;
      }
    };
  }, []);

  const openRegisterMenu = useCallback(() => {
    handlerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({ openRegisterMenu, bindOpenHandler }),
    [bindOpenHandler, openRegisterMenu]
  );

  return (
    <RegisterActivityContext.Provider value={value}>{children}</RegisterActivityContext.Provider>
  );
}

export function useRegisterActivity(): RegisterActivityContextValue {
  const context = useContext(RegisterActivityContext);
  if (!context) {
    throw new Error('useRegisterActivity must be used within RegisterActivityProvider');
  }
  return context;
}
