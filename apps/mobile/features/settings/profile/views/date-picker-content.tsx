import {useState, forwardRef, useImperativeHandle, useCallback} from 'react';
import {Palette} from '@/constants';
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
} from '@/modules/sykamore-ui';
import {formatDate} from '@/utils';
import {useProfile} from '../hooks';

export type DatePickerContentHandle = {
  save: () => Promise<void>;
};

export const DatePickerContent = forwardRef<DatePickerContentHandle>(
  (_, ref) => {
    const {dateOfBirth, updateDateOfBirth} = useProfile();

    const [selectedDate, setSelectedDate] = useState<Date>(
      dateOfBirth ? new Date(dateOfBirth) : new Date(),
    );

    const save = useCallback(async () => {
      await updateDateOfBirth(selectedDate);
    }, [selectedDate, updateDateOfBirth]);

    useImperativeHandle(ref, () => ({save}), [save]);

    return (
      <Host style={{flex: 1}}>
        <Form>
          <Section>
            <HStack>
              <Text>Date of Birth</Text>
              <Spacer />
              <Text
                modifiers={[
                  foregroundStyle({styleType: 'color', color: Palette.blue}),
                ]}
              >
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
