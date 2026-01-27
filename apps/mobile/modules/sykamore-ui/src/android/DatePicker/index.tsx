import {requireNativeView} from 'expo';

import type {ExpoModifier} from '../types';

export type DatePickerMode = 'date' | 'time';
export type DatePickerVariant = 'picker' | 'input';

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
  /**
   * Determines the date picker UI style.
   * @default 'picker'
   */
  variant?: DatePickerVariant;
  /**
   * Show the input/picker toggle button for date mode.
   * @default true
   */
  showVariantToggle?: boolean;
  /**
   * Optional title for the time picker dialog.
   * @default 'Select time'
   */
  timeTitle?: string;
  /**
   * Overrides the 24-hour format in time mode.
   * @default system
   */
  is24Hour?: boolean;
  /**
   * Modifiers for the component.
   */
  modifiers?: ExpoModifier[];
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
    // @ts-expect-error
    modifiers: props.modifiers?.map((m) => m.__expo_shared_object_id__),
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
