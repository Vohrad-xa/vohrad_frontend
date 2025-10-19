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
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  placeholder: string;
  disabled: boolean;
  inputStyle: object;
  theme: ThemeShape;
  scheme: 'light' | 'dark';
};

export const DatePickerWeb: React.FC<DatePickerWebProps> = ({
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
        .react-datepicker { background: ${theme.background} !important; color: ${theme.text} !important; border-color: ${theme.border} !important; }
        .react-datepicker__header { background: ${theme.input} !important; border-bottom-color: ${theme.border} !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: ${theme.text} !important; }
        .react-datepicker__day--selected { background: ${theme.tint} !important; color: #fff !important; }
        .react-datepicker__day:hover { background: ${theme.surface} !important; }
        .react-datepicker__day--disabled { color: ${theme.muted} !important; }
      `;
      document.head.appendChild(style);
    }
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View style={{width: '100%'}}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => {
          if (date) {
            onDateChange(date);
          }
        }}
        dateFormat="yyyy-MM-dd"
        maxDate={new Date()}
        placeholderText={placeholder}
        disabled={disabled}
        customInput={
          <TextInput
            value={formatDate(selectedDate)}
            placeholder={placeholder}
            editable={false}
            style={inputStyle}
          />
        }
      />
    </View>
  );
};
