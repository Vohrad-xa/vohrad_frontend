import {requireNativeView} from 'expo';
import {StyleProp, ViewStyle} from 'react-native';

export type DatePickerMode = 'date' | 'time';

export type DatePickerProps = {
  initialDate?: string | null;
  onDateSelected?: (date: Date | null) => void;
  onDismiss?: () => void;
  confirmText?: string;
  dismissText?: string;
  /**
   * Determines which picker to show.
   * @default 'date'
   */
  mode?: DatePickerMode;
  style?: StyleProp<ViewStyle>;
};

type NativeDatePickerProps = Omit<
  DatePickerProps,
  'onDateSelected' | 'initialDate' | 'onDismiss'
> & {
  initialDate?: number | null;
  onDateSelected?: (event: {nativeEvent: {date: number | null}}) => void;
  onDismiss?: (event: {nativeEvent: Record<string, never>}) => void;
};

/**
 * @hidden
 */
export function transformDatePickerProps(
  props: DatePickerProps,
): NativeDatePickerProps {
  const {initialDate, onDateSelected, onDismiss, ...rest} = props;

  // Convert ISO string to timestamp for Android
  const initialDateTimestamp = initialDate
    ? new Date(initialDate).getTime()
    : null;

  return {
    ...rest,
    mode: props.mode ?? 'date',
    initialDate: initialDateTimestamp,
    onDateSelected: onDateSelected
      ? ({nativeEvent: {date}}) => {
          onDateSelected(date ? new Date(date) : null);
        }
      : undefined,
    onDismiss: onDismiss
      ? () => {
          onDismiss();
        }
      : undefined,
  };
}

const DatePickerNativeView: React.ComponentType<NativeDatePickerProps> =
  requireNativeView('SykamoreUi', 'DatePickerView');

/**
 * Renders a modal `DatePicker` component.
 */
export function DatePicker(props: DatePickerProps) {
  return <DatePickerNativeView {...transformDatePickerProps(props)} />;
}
