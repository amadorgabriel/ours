import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { useTranslation } from '@/presentation/hooks/use-translation';

export type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  accessibilityLabel?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

function formatDisplayDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return isoDate;
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function parseIsoDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return new Date();
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePickerField({
  label,
  value,
  onChange,
  accessibilityLabel,
  minimumDate,
  maximumDate,
}: DatePickerFieldProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [pendingDate, setPendingDate] = useState<Date>(() => parseIsoDate(value));

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (!selectedDate) {
      return;
    }

    setPendingDate(selectedDate);
    onChange(toIsoDate(selectedDate));

    if (Platform.OS === 'ios') {
      setShowPicker(false);
    }
  }

  function openPicker() {
    setPendingDate(parseIsoDate(value));
    setShowPicker(true);
  }

  return (
    <View>
      <Text className="font-sans text-sm text-mindful-brown">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? t('datePicker.selectDate')}
        className="mt-2 rounded-xl bg-white px-4 py-3"
        onPress={openPicker}
      >
        <Text className="font-sans text-mindful-brown">
          {value.trim() ? formatDisplayDate(value) : t('datePicker.selectDate')}
        </Text>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode="date"
          value={pendingDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}
