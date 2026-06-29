import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AlertProvider } from './alert';
import { AssistidoProvider } from './assistido';
import { AuthProvider } from './auth';
import { SessionBootstrap } from './auth/session-bootstrap';
import { FamilyProvider } from './family';
import { NotificationProvider } from './notifications';
import { QueryProvider } from './query';

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <QueryProvider>
          <AuthProvider>
            <FamilyProvider>
              <SessionBootstrap>
                <NotificationProvider>
                  <AssistidoProvider>
                    <AlertProvider>{children}</AlertProvider>
                  </AssistidoProvider>
                </NotificationProvider>
              </SessionBootstrap>
            </FamilyProvider>
          </AuthProvider>
        </QueryProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
