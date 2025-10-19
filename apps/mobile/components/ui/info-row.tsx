import React, {memo, useMemo} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';

type InfoRowInputProps = Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'placeholder'
>;

type InfoRowProps = {
  label: string;
  value?: string | null;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  inputProps?: InfoRowInputProps;
  inputRef?: React.RefObject<TextInput | null>;
  type?: 'text' | 'date';
};

const InfoRowComponent: React.FC<InfoRowProps> = ({
  label,
  value,
  editable = false,
  onChangeText,
  placeholder,
  inputProps,
  inputRef,
  type = 'text',
}) => {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme);
  const displayValue = value ?? '';
  const inputStyle = inputProps?.style as StyleProp<TextStyle> | undefined;
  const fallbackLabel = placeholder ?? 'Not set';

  const selectedDate = useMemo(() => {
    if (!value || type !== 'date') return new Date();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value, type]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date && onChangeText) {
      onChangeText(formatDate(date));
    }
  };

  const openDatePicker = () => {
    if (!editable || type !== 'date') return;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        onChange: handleDateChange,
        mode: 'date',
        maximumDate: new Date(),
      });
    }
  };

  const handleRowPress = () => {
    if (!editable) return;

    if (type === 'date') {
      openDatePicker();
    } else if (inputRef?.current) {
      inputRef.current.focus();
    }
  };

  if (type === 'date' && Platform.OS === 'ios' && editable) {
    return (
      <View style={styles.row}>
        <ThemedText variant="label" colorToken="label">
          {label}
        </ThemedText>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="compact"
          onChange={handleDateChange}
          maximumDate={new Date()}
          themeVariant={scheme}
          // accentColor={theme.tint}
          style={styles.iosDatePicker}
        />
      </View>
    );
  }

  if (type === 'date' && Platform.OS === 'ios' && !editable) {
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
  }

  return (
    <Pressable onPress={handleRowPress} style={styles.row}>
      <ThemedText variant="label" colorToken="label">
        {label}
      </ThemedText>
      <TextInput
        ref={inputRef}
        value={displayValue}
        onChangeText={
          type === 'date' && Platform.OS !== 'web' ? undefined : onChangeText
        }
        placeholder={fallbackLabel}
        placeholderTextColor={theme.iosPlaceholder}
        selectionColor={theme.tint}
        underlineColorAndroid="transparent"
        editable={
          type === 'date' && Platform.OS === 'android' ? false : editable
        }
        textAlignVertical="center"
        {...inputProps}
        style={[styles.valueText, inputStyle]}
      />
    </Pressable>
  );
};

InfoRowComponent.displayName = 'InfoRow';

export const InfoRow = memo(InfoRowComponent);

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
      valueText: {
        ...ds.typography.value,
        flexShrink: 1,
        textAlign: 'right',
        color: theme.muted,
      },
      emptyValue: {
        fontStyle: 'italic',
        opacity: ds.opacity.disabled,
      },
      iosDatePicker: {
        flex: 1,
        alignSelf: 'flex-end',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
