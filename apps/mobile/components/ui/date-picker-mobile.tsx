import React from 'react';
import {View} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {ThemedText} from './themed-text';

type DatePickerMobileProps = {
  label: string;
  selectedDate: Date;
  onDateChange: (event: DateTimePickerEvent, date?: Date) => void;
  editable: boolean;
  displayValue: string;
  fallbackLabel: string;
  scheme: 'light' | 'dark';
  styles: {
    row: object;
    valueText: object;
    iosDatePicker: object;
  };
};

export const DatePickerMobile: React.FC<DatePickerMobileProps> = ({
  label,
  selectedDate,
  onDateChange,
  editable,
  displayValue,
  fallbackLabel,
  scheme,
  styles,
}) => {
  // iOS: Native compact date picker (editable)
  if (editable) {
    return (
      <View style={styles.row}>
        <ThemedText variant="label">{label}</ThemedText>
        <View style={styles.iosDatePicker}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="compact"
            onChange={onDateChange}
            maximumDate={new Date()}
            themeVariant={scheme}
          />
        </View>
      </View>
    );
  }

  // iOS: Read-only text (non-editable)
  return (
    <View style={styles.row}>
      <ThemedText variant="label" colorToken="label">
        {label}
      </ThemedText>
      <ThemedText variant="value" style={styles.valueText}>
        {displayValue || fallbackLabel}
      </ThemedText>
    </View>
  );
};
