import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { isCallReminderNotification } from '@/core/infra/notifications/notification-service';
import * as Notifications from 'expo-notifications';

type NotificationContextValue = {
  callNowRequested: boolean;
  consumeCallNowRequest: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [callNowRequested, setCallNowRequested] = useState(false);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    if (isCallReminderNotification(response.notification.request.content.data)) {
      setCallNowRequested(true);
    }
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [handleNotificationResponse]);

  const value = useMemo(
    () => ({
      callNowRequested,
      consumeCallNowRequest: () => setCallNowRequested(false),
    }),
    [callNowRequested]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotificationActions() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationActions must be used within NotificationProvider');
  }

  return context;
}
