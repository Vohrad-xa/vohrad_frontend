import React, {useCallback, useMemo, useState} from 'react';
import {Platform, StyleSheet, TouchableOpacity, View} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {Input} from './input';

export interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  maximumDate,
  minimumDate,
  placeholder,
}: DatePickerProps) {
  const {theme, ds} = useTheme();
  const styles = createStyles(theme, ds);
  const [isIOSPickerVisible, setIsIOSPickerVisible] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) {
      return new Date();
    }

    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (event.type !== 'set' || !date) {
        return;
      }

      onChange(formatDate(date));
    },
    [onChange],
  );

  const openAndroidPicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      onChange: handleAndroidChange,
      mode: 'date',
      maximumDate,
      minimumDate,
    });
  }, [handleAndroidChange, maximumDate, minimumDate, selectedDate]);

  const handleIOSChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (!date) {
      return;
    }

    onChange(formatDate(date));
  };

  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openAndroidPicker}
          style={styles.androidTrigger}
        >
          <View pointerEvents="none">
            <Input
              value={value ?? ''}
              placeholder={placeholder ?? 'Select date'}
              editable={false}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Input
          value={value ?? ''}
          placeholder={placeholder ?? 'Select date'}
          onChangeText={onChange}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsIOSPickerVisible((prev) => !prev)}
        style={styles.iosTrigger}
      >
        <View pointerEvents="none">
          <Input
            value={value ?? ''}
            placeholder={placeholder ?? 'Select date'}
            editable={false}
          />
        </View>
      </TouchableOpacity>

      {isIOSPickerVisible ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={handleIOSChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          themeVariant={
            theme.version.toString().includes('dark') ? 'dark' : 'light'
          }
          textColor={theme.text}
          style={styles.iosPicker}
        />
      ) : null}
    </View>
  );
}

const createStyles = makeStyleFactory(
  (theme: ThemeShape, ds: DSShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.sm,
        width: '100%',
      },
      androidTrigger: {
        width: '100%',
      },
      iosTrigger: {
        width: '100%',
      },
      iosPicker: {
        width: '100%',
      },
    }),
  (theme, ds) => themeKey(theme, ds),
);
