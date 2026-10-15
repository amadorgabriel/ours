import { RNHostView } from '@expo/ui';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { colors } from '@/presentation/styles/tokens';

const MAX_NOTES_LENGTH = 500;
const SHEET_HORIZONTAL_INSET = 32;

export function FormHost({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();

  return (
    <RNHostView matchContents>
      <View style={{ width: Math.max(0, width - SHEET_HORIZONTAL_INSET) }}>{children}</View>
    </RNHostView>
  );
}

export function NotesField({
  label,
  value,
  onChangeText,
  placeholder,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  testID: string;
}) {
  return (
    <FormHost>
      <View>
        <Text className="font-sans text-sm text-mindful-brown">{label}</Text>
        <TextInput
          accessibilityLabel={label}
          className="mt-2 min-h-[96px] rounded-xl border border-mindful-brown/30 bg-white px-4 py-3 font-sans text-mindful-brown"
          maxLength={MAX_NOTES_LENGTH}
          multiline
          placeholder={placeholder}
          placeholderTextColor={colors.mindfulBrown60}
          testID={testID}
          textAlignVertical="top"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </FormHost>
  );
}

export function AllDayField({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <FormHost>
      <View className="min-h-12 flex-row items-center justify-between rounded-xl border border-mindful-brown/20 bg-white px-4 py-3">
        <Text className="font-sans text-sm text-mindful-brown">{label}</Text>
        <Switch
          accessibilityLabel={label}
          thumbColor={colors.textLight}
          trackColor={{ false: '#D6D3D1', true: colors.serenityGreen60 }}
          value={value}
          onValueChange={onValueChange}
        />
      </View>
    </FormHost>
  );
}

export function FormTextAction({
  label,
  onPress,
  testID,
  tone = 'danger',
}: {
  label: string;
  onPress: () => void;
  testID: string;
  tone?: 'danger' | 'neutral';
}) {
  return (
    <FormHost>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        className="min-h-11 items-start justify-center"
        testID={testID}
        onPress={onPress}
      >
        <Text className={`font-sans-semibold ${tone === 'danger' ? 'text-red-600' : 'text-mindful-brown'}`}>
          {label}
        </Text>
      </Pressable>
    </FormHost>
  );
}

export function FormActionRow({
  primaryLabel,
  onPrimary,
  primaryTestID,
  primaryDisabled = false,
  primaryPending = false,
  secondaryLabel,
  onSecondary,
  secondaryTestID,
  secondaryTone = 'neutral',
  secondaryDisabled = false,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  primaryTestID: string;
  primaryDisabled?: boolean;
  primaryPending?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryTestID?: string;
  secondaryTone?: 'neutral' | 'danger';
  secondaryDisabled?: boolean;
}) {
  const secondaryClass =
    secondaryTone === 'danger'
      ? 'border-red-600'
      : 'border-serenity-green';
  const secondaryTextClass =
    secondaryTone === 'danger' ? 'text-red-600' : 'text-serenity-green';

  return (
    <FormHost>
      <View className={secondaryLabel ? 'w-full flex-row gap-3' : 'w-full'}>
        {secondaryLabel && onSecondary ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={secondaryLabel}
            className={`min-h-12 flex-1 items-center justify-center rounded-full border ${secondaryClass} ${
              secondaryDisabled ? 'opacity-40' : ''
            }`}
            disabled={secondaryDisabled}
            testID={secondaryTestID}
            onPress={onSecondary}
          >
            <Text className={`font-sans-semibold ${secondaryTextClass}`} numberOfLines={1}>
              {secondaryLabel}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
          accessibilityState={{ disabled: primaryDisabled || primaryPending, busy: primaryPending }}
          className={`min-h-12 items-center justify-center rounded-full bg-serenity-green ${
            secondaryLabel ? 'flex-1' : 'w-full'
          } ${primaryDisabled ? 'opacity-40' : ''}`}
          disabled={primaryDisabled || primaryPending}
          testID={primaryTestID}
          onPress={onPrimary}
        >
          {primaryPending ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text className="font-sans-semibold text-light" numberOfLines={1}>
              {primaryLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </FormHost>
  );
}
