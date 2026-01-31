import React, {forwardRef, useImperativeHandle} from 'react';
import {formatDate} from '@/utils';
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
import {useProfileEdit} from '../hooks';

export type DatePickerContentHandle = {
  save: () => Promise<void>;
};

export const DatePickerContent = forwardRef<DatePickerContentHandle>(
  (_, ref) => {
    const {dateOfBirth: dob} = useProfileEdit();
    const {selectedDate, setSelectedDate, save} = dob;

    useImperativeHandle(ref, () => ({save}), [save]);

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
  },
);

DatePickerContent.displayName = 'DatePickerContent';
