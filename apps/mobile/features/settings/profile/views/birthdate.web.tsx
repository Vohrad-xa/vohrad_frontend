import React, {forwardRef, useImperativeHandle, useMemo} from 'react';
import {View} from 'react-native';
import {HelperText} from 'react-native-paper';
import {useTheme} from '@/providers';
import {formatDate} from '@/utils';
import {useProfileEdit} from '../hooks/use-profile-edit';

export type DatePickerContentHandle = {
  save: () => Promise<void>;
};

export const DatePickerContent = forwardRef<DatePickerContentHandle>(
  (_, ref) => {
    const {ds, theme} = useTheme();

    const {dateOfBirth: dob} = useProfileEdit();
    const {selectedDate, setSelectedDate, save} = dob;

    useImperativeHandle(ref, () => ({save}), [save]);

    const value = useMemo(
      () => selectedDate.toISOString().slice(0, 10),
      [selectedDate],
    );

    const fieldStyle: React.CSSProperties = {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.border,
      borderRadius: ds.borderRadius.md,
      background: theme.modalBackground,
      padding: 12,
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      fontSize: 12,
      marginBottom: 8,
      color: theme.text,
    };

    const inputStyle: React.CSSProperties = {
      width: '100%',
      fontSize: 16,
      color: theme.text,
      background: 'transparent',
      border: 'none',
      outline: 'none',
    };

    return (
      <View style={{flex: 1, gap: ds.spacing.md}}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Date of Birth</label>
          <input
            type="date"
            value={value}
            onChange={(e) => {
              const next = e.currentTarget.value; // YYYY-MM-DD
              if (!next) return;

              // Local date to avoid timezone shifts
              const [y, m, d] = next.split('-').map(Number);
              const date = new Date(y, (m ?? 1) - 1, d ?? 1);

              if (!Number.isNaN(date.getTime())) {
                setSelectedDate(date);
              }
            }}
            style={inputStyle}
          />
        </div>

        <HelperText type="info" visible variant="bodySmall">
          Please do not forget to save your changes after selecting your date of
          birth. Current: {formatDate(selectedDate.toISOString())}
        </HelperText>
      </View>
    );
  },
);

DatePickerContent.displayName = 'DatePickerContent';
