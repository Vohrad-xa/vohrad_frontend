import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {Platform, Pressable, View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {ThemedText} from '@/components/ui';
import {useTheme} from '@/providers';
import {formatDate} from '@/utils';
import {DatePicker as AndroidDatePicker} from 'sykamore-ui/android';
import {
  Host,
  HStack,
  Text,
  DatePicker,
  datePickerStyle,
  foregroundStyle,
  Form,
  Section,
  Spacer,
} from 'sykamore-ui/ios';
import {useProfile} from '../hooks';

export type DatePickerContentHandle = {
  save: () => Promise<void>;
};

export const DatePickerContent = forwardRef<DatePickerContentHandle>(
  (_, ref) => {
    const {ds, theme} = useTheme();
    const {dateOfBirth, updateDateOfBirth} = useProfile();

    const [selectedDate, setSelectedDate] = useState<Date>(
      dateOfBirth ? new Date(dateOfBirth) : new Date(),
    );
    const [showDatePicker, setShowDatePicker] = useState(false);

    const save = useCallback(async () => {
      await updateDateOfBirth(selectedDate);
    }, [selectedDate, updateDateOfBirth]);

    useImperativeHandle(ref, () => ({save}), [save]);

    const handleDateSelected = useCallback((date: Date | null) => {
      if (date) {
        setSelectedDate(date);
      }
      setShowDatePicker(false);
    }, []);

    const handleDismiss = useCallback(() => {
      setShowDatePicker(false);
    }, []);

    if (Platform.OS === 'ios') {
      return (
        <Host style={{flex: 1}}>
          <Form>
            <Section>
              <HStack>
                <Text>Date of Birth</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle('secondary')]}>
                  {formatDate(selectedDate.toISOString())}
                </Text>
              </HStack>
            </Section>

            <DatePicker
              selection={selectedDate}
              displayedComponents={['date']}
              onDateChange={setSelectedDate}
              modifiers={[datePickerStyle('graphical')]}
            />
          </Form>
        </Host>
      );
    }

    return (
      <View style={{flex: 1, gap: ds.spacing.md}}>
        <ThemedText>Select your date of birth</ThemedText>
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
        {showDatePicker && (
          <AndroidDatePicker
            initialDate={selectedDate.toISOString()}
            onDateSelected={handleDateSelected}
            onDismiss={handleDismiss}
            confirmText="OK"
            dismissText="Cancel"
          />
        )}
      </View>
    );
  },
);

DatePickerContent.displayName = 'DatePickerContent';
