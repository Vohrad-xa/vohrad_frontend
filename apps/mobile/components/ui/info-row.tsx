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
import {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {DatePickerMobile} from './date-picker-mobile';
import {DatePickerWeb} from './date-picker-web';
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
  const rowStyles = usePlatformStyles({
    mobile: styles.row,
    web: styles.rowWeb,
  });
  const platformValueTextStyles = usePlatformStyles({
    mobile: styles.valueText,
    web: styles.valueTextWeb,
  });
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

  // === DATE PICKERS ===

  // iOS: Native date picker
  if (type === 'date' && Platform.OS === 'ios') {
    return (
      <DatePickerMobile
        label={label}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        editable={editable}
        displayValue={displayValue}
        fallbackLabel={fallbackLabel}
        scheme={scheme}
        styles={styles}
      />
    );
  }

  // Web: react-datepicker
  if (type === 'date' && Platform.OS === 'web') {
    return (
      <View style={rowStyles}>
        <ThemedText variant="label" colorToken="label">
          {label}
        </ThemedText>
        <DatePickerWeb
          selectedDate={selectedDate}
          onDateChange={(date) => {
            if (onChangeText) {
              onChangeText(formatDate(date));
            }
          }}
          placeholder={fallbackLabel}
          disabled={!editable}
          inputStyle={platformValueTextStyles}
          theme={theme}
          scheme={scheme}
        />
      </View>
    );
  }

  // === STANDARD TEXT INPUT (Android date + all text inputs) ===

  return (
    <Pressable onPress={handleRowPress} style={rowStyles}>
      <ThemedText variant="label" colorToken="label">
        {label}
      </ThemedText>
      <TextInput
        ref={inputRef}
        value={displayValue}
        onChangeText={onChangeText}
        placeholder={fallbackLabel}
        placeholderTextColor={theme.iosPlaceholder}
        selectionColor={theme.tint}
        underlineColorAndroid="transparent"
        editable={
          type === 'date' && Platform.OS === 'android' ? false : editable
        }
        textAlignVertical="center"
        {...inputProps}
        style={[platformValueTextStyles, inputStyle]}
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
      rowWeb: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: ds.spacing.xs,
        width: '100%',
        flex: 1,
      },
      valueText: {
        ...ds.typography.value,
        flexShrink: 1,
        textAlign: 'right',
        color: theme.muted,
      },
      valueTextWeb: {
        ...ds.typography.body,
        width: '100%',
        textAlign: 'left',
        color: theme.text,
        paddingHorizontal: ds.spacing.md,
        paddingVertical: ds.spacing.sm,
        borderRadius: ds.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.input,
        minHeight: ds.components.tapTarget.minSize,
      },
      iosDatePicker: {
        flex: 1,
        alignSelf: 'flex-end',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
