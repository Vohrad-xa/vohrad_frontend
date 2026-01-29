import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {Pressable, View} from 'react-native';
import {HelperText, TextInput} from 'react-native-paper';
import {useTheme} from '@/providers';
import {formatDate} from '@/utils';
import {DatePicker as AndroidDatePicker} from 'sykamore-ui/android';
import {useProfileEdit} from '../hooks';

export type DatePickerContentHandle = {
  save: () => Promise<void>;
};

export const DatePickerContent = forwardRef<DatePickerContentHandle>(
  (_, ref) => {
    const {ds, theme} = useTheme();

    const {dateOfBirth: dob} = useProfileEdit();
    const {selectedDate, setSelectedDate, save} = dob;

    const [showDatePicker, setShowDatePicker] = useState(false);

    useImperativeHandle(ref, () => ({save}), [save]);

    const handleDateSelected = useCallback(
      (date: Date | null) => {
        if (date) setSelectedDate(date);
        setShowDatePicker(false);
      },
      [setSelectedDate],
    );

    const handleDismiss = useCallback(() => {
      setShowDatePicker(false);
    }, []);

    return (
      <View style={{flex: 1, gap: ds.spacing.md}}>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          accessibilityLabel="Select Date of Birth"
          accessibilityHint="Opens date picker to select your date of birth"
        >
          <TextInput
            value={selectedDate ? formatDate(selectedDate.toISOString()) : ''}
            editable={false}
            mode="outlined"
            pointerEvents="none"
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
                color={theme.accentBlue}
                rippleColor={theme.ripple}
              />
            }
          />
        </Pressable>

        <HelperText type="info" visible variant="bodySmall">
          Please do not forget to save your changes after selecting your date of
          birth.
        </HelperText>

        {showDatePicker && (
          <AndroidDatePicker
            initialDate={selectedDate.toISOString()}
            onDateSelected={handleDateSelected}
            onDismiss={handleDismiss}
            confirmText="Select"
            dismissText="Cancel"
          />
        )}
      </View>
    );
  },
);

DatePickerContent.displayName = 'DatePickerContent';
