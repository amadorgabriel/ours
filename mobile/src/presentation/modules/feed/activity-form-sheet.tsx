import { Column, ScrollView, Text } from '@expo/ui';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { spacing, type } from '@/presentation/styles/tokens';

import { BrandedSheet } from './branded-sheet';
import { FormHost } from './form-controls';
import { getSheetKeyboardModifiers, getSheetScrollModifiers, SheetKeyboardInset } from './sheet-keyboard';

type ActivityFormSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  testID?: string;
  children: ReactNode;
};

export function ActivityFormSheet({
  visible,
  onClose,
  title,
  description,
  testID,
  children,
}: ActivityFormSheetProps) {
  return (
    <BrandedSheet
      isPresented={visible}
      modifiers={getSheetKeyboardModifiers()}
      testID={testID}
      onDismiss={onClose}
    >
      <ScrollView modifiers={getSheetScrollModifiers()}>
        <Column spacing={spacing.md}>
          <Text textStyle={type.title}>{title}</Text>
          {description ? <Text textStyle={type.body}>{description}</Text> : null}
          {children}
          <SheetKeyboardInset />
        </Column>
      </ScrollView>
    </BrandedSheet>
  );
}

export function AppSheet({
  visible,
  onClose,
  title,
  description,
  testID,
  children,
}: ActivityFormSheetProps) {
  return (
    <ActivityFormSheet
      description={description}
      testID={testID}
      title={title}
      visible={visible}
      onClose={onClose}
    >
      <FormHost>
        <View>{children}</View>
      </FormHost>
    </ActivityFormSheet>
  );
}
