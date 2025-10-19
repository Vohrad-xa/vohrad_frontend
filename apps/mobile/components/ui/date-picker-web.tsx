import React from 'react';
import {View, TextInput, Platform} from 'react-native';
import {type ThemeShape} from '@/constants/theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ReactDatePicker: any = null;
if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ReactDatePicker = require('react-datepicker').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-datepicker/dist/react-datepicker.css');
}

type DatePickerWebProps = {
  mode: 'date' | 'time';
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  placeholder: string;
  disabled: boolean;
  inputStyle: object;
  theme: ThemeShape;
  scheme: 'light' | 'dark';
};

export const DatePickerWeb: React.FC<DatePickerWebProps> = ({
  mode,
  selectedDate,
  onDateChange,
  placeholder,
  disabled,
  inputStyle,
  theme,
  scheme,
}) => {
  if (Platform.OS !== 'web' || !ReactDatePicker) return null;

  // Inject theme-specific styles
  if (typeof document !== 'undefined') {
    const styleId = `datepicker-theme-${scheme}`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .react-datepicker { background: ${theme.background} !important; color: ${theme.text} !important; border: 1px solid ${theme.border} !important; border-radius: 12px !important; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important; overflow: hidden !important; }
        .react-datepicker__header { background: ${theme.input} !important; border-bottom: 1px solid ${theme.border} !important; border-top-left-radius: 12px !important; border-top-right-radius: 12px !important; padding-top: 12px !important; }
        .react-datepicker__current-month { color: ${theme.text} !important; font-weight: 600 !important; font-size: 14px !important; }
        .react-datepicker__day-name { color: ${theme.text} !important; font-weight: 500 !important; }
        .react-datepicker__day { color: ${theme.text} !important; border-radius: 6px !important; }
        .react-datepicker__day--selected { background: ${theme.tint} !important; color: #fff !important; font-weight: 600 !important; }
        .react-datepicker__day:hover { background: ${theme.surface} !important; border-radius: 6px !important; }
        .react-datepicker__day--disabled { color: ${theme.muted} !important; opacity: 0.5 !important; }
        .react-datepicker__time-container { background: ${theme.background} !important; border-left-color: ${theme.border} !important; width: 208px !important; }
        .react-datepicker__time-container .react-datepicker__time { background: ${theme.background} !important; width: 100% !important; }
        .react-datepicker__time-container .react-datepicker__time-box { width: 100% !important; }
        .react-datepicker__time-list { width: 100% !important; }
        .react-datepicker__time-container .react-datepicker__time-box { border-color: ${theme.border} !important; }
        .react-datepicker-time__header { color: ${theme.text} !important; }
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item { color: ${theme.text} !important; height: 30px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
        .react-datepicker__time-list-item:hover { background: ${theme.surface} !important; }
        .react-datepicker__time-list-item--selected { background: ${theme.tint} !important; color: #fff !important; }
      `;
      document.head.appendChild(style);
    }
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return '';
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const selected = selectedDate ?? undefined;
  const isTimeMode = mode === 'time';
  const formattedValue = isTimeMode
    ? formatTime(selectedDate)
    : formatDate(selectedDate);

  return (
    <View style={{width: '100%'}}>
      <ReactDatePicker
        selected={selected}
        onChange={(date: Date | null) => {
          if (date) {
            onDateChange(date);
          }
        }}
        dateFormat={isTimeMode ? 'HH:mm' : 'yyyy-MM-dd'}
        timeFormat={isTimeMode ? 'HH:mm' : undefined}
        showTimeSelect={isTimeMode}
        showTimeSelectOnly={isTimeMode}
        timeIntervals={isTimeMode ? 15 : undefined}
        timeCaption={isTimeMode ? 'Time' : undefined}
        maxDate={isTimeMode ? undefined : new Date()}
        placeholderText={placeholder}
        disabled={disabled}
        customInput={
          <TextInput
            value={formattedValue}
            placeholder={placeholder}
            editable={false}
            style={inputStyle}
          />
        }
      />
    </View>
  );
};
