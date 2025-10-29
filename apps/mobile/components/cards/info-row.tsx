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
import {type TokenName} from '@/constants/colors';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {usePlatformStyles} from '@/hooks';
import {useTheme} from '@/providers';
import {type IconName} from '@/utils/icons';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import {DatePickerMobile} from '../ui/date-picker-mobile';
import {DatePickerWeb} from '../ui/date-picker-web';
import {ThemedText} from '../ui/themed-text';

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
  type?: 'text' | 'date' | 'time';
  keyboardType?: TextInputProps['keyboardType'];
  renderAccessory?: React.ReactNode;
  icon?: IconName; // Icon name to display at the start of the row
  iconSize?: number; // Icon size (defaults to 20)
  iconColorToken?: TokenName; // Icon color token (defaults to 'muted')
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
  keyboardType,
  renderAccessory,
  icon,
  iconSize = 20,
  iconColorToken = 'muted',
}) => {
  const {ds, theme, scheme} = useTheme();
  const styles = createStyles(ds, theme);
  const rowStyles = usePlatformStyles(
    renderAccessory
      ? {
          mobile: styles.row,
          web: styles.rowWebAccessory,
        }
      : {
          mobile: styles.row,
          web: styles.rowWeb,
        },
  );
  const platformValueTextStyles = usePlatformStyles({
    mobile: styles.valueText,
    web: styles.valueTextWeb,
  });
  const inputStyle = inputProps?.style as StyleProp<TextStyle> | undefined;
  const fallbackLabel = placeholder ?? 'Not set';
  const displayValue = value ?? '';
  const accessoryStyles = usePlatformStyles({
    mobile: styles.accessoryContainer,
    web: styles.accessoryContainerWeb,
  });

  // Helper function to render label with optional icon
  const renderLabelWithIcon = (labelText: string) => {
    if (icon) {
      return (
        <View style={styles.labelWithIcon}>
          <View style={styles.iconContainer}>
            <Icon name={icon} size={iconSize} colorToken={iconColorToken} />
          </View>
          <ThemedText variant="label" colorToken="label">
            {labelText}
          </ThemedText>
        </View>
      );
    }
    return (
      <ThemedText variant="label" colorToken="label">
        {labelText}
      </ThemedText>
    );
  };

  const selectedDate = useMemo(() => {
    if (!value || type !== 'date') return new Date();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value, type]);

  const selectedTime = useMemo(() => {
    if (!value || type !== 'time') {
      const now = new Date();
      now.setHours(9, 0, 0, 0);
      return now;
    }
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  }, [value, type]);

  if (renderAccessory) {
    return (
      <View style={rowStyles}>
        <View style={styles.accessoryLabelContainer}>
          {renderLabelWithIcon(label)}
        </View>
        <View style={accessoryStyles}>{renderAccessory}</View>
      </View>
    );
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date && onChangeText) {
      onChangeText(formatDate(date));
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date && onChangeText) {
      onChangeText(formatTime(date));
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

  const openTimePicker = () => {
    if (!editable || type !== 'time') return;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedTime,
        onChange: handleTimeChange,
        mode: 'time',
        is24Hour: true,
      });
    }
  };

  const handleRowPress = () => {
    if (!editable) return;

    if (type === 'date') {
      openDatePicker();
    } else if (type === 'time') {
      openTimePicker();
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
        {renderLabelWithIcon(label)}
        <DatePickerWeb
          mode="date"
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
          ds={ds}
        />
      </View>
    );
  }

  // Web: react-datepicker for time selection
  if (type === 'time' && Platform.OS === 'web') {
    const selectedTimeValue = displayValue ? selectedTime : null;

    return (
      <View style={rowStyles}>
        {renderLabelWithIcon(label)}
        <DatePickerWeb
          mode="time"
          selectedDate={selectedTimeValue}
          onDateChange={(date) => {
            if (onChangeText) {
              onChangeText(formatTime(date));
            }
          }}
          placeholder={fallbackLabel}
          disabled={!editable}
          inputStyle={platformValueTextStyles}
          theme={theme}
          scheme={scheme}
          ds={ds}
        />
      </View>
    );
  }

  // === TIME PICKERS ===

  // iOS: Native time picker
  if (type === 'time' && Platform.OS === 'ios') {
    if (editable) {
      return (
        <View style={styles.row}>
          {renderLabelWithIcon(label)}
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="compact"
            onChange={handleTimeChange}
            themeVariant={scheme}
            style={styles.iosDatePicker}
          />
        </View>
      );
    }

    return (
      <View style={styles.row}>
        {renderLabelWithIcon(label)}
        <ThemedText variant="value" style={styles.valueText}>
          {displayValue || fallbackLabel}
        </ThemedText>
      </View>
    );
  }

  // Android: Text input that opens native modal via press
  if (type === 'time' && Platform.OS === 'android') {
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
            type === 'time' && Platform.OS === 'android' ? false : editable
          }
          textAlignVertical="center"
          keyboardType={keyboardType}
          {...inputProps}
          style={[platformValueTextStyles, inputStyle]}
        />
      </Pressable>
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
        keyboardType={keyboardType}
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
      rowWebAccessory: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      },
      accessoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.md,
        justifyContent: 'flex-end',
      },
      accessoryContainerWeb: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: ds.spacing.sm,
      },
      accessoryLabelContainer: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 0,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: ds.spacing.xl,
        borderRadius: ds.borderRadius.lg,
        padding: 4,
        backgroundColor: theme.highlight,
      },
      labelWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
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
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginVertical: -ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
