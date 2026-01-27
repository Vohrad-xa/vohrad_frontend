import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme, useHaptic} from '@/providers';
import {DatePicker, Switch} from 'sykamore-ui/android';
import {dialogBackground, tintColor} from 'sykamore-ui/android/modifiers';
import {useBusinessHours} from '../hooks/use-business-hours';

export function BusinessHours() {
  const {theme, ds} = useTheme();
  const {triggerHaptic} = useHaptic();

  const {
    businessHoursEnabled,
    businessHourEnd,
    businessHourStart,
    dismissTimePicker,
    handleTimeSelected,
    isLoading,
    openTimePicker,
    organizationTimezone,
    activeTimePicker,
    activeTimePickerDate,
    toggleBusinessHours,
  } = useBusinessHours();

  const handleToggleBusinessHours = React.useCallback(
    async (enabled: boolean) => {
      triggerHaptic('light');
      await toggleBusinessHours(enabled);
    },
    [toggleBusinessHours, triggerHaptic],
  );

  const canInteract = !isLoading;

  const timezoneLabel = organizationTimezone.length
    ? organizationTimezone
    : 'Not set';

  const startTimeLabel = businessHourStart.length
    ? businessHourStart
    : 'Not set';

  const endTimeLabel = businessHourEnd.length ? businessHourEnd : 'Not set';

  const canEditTimes = canInteract && businessHoursEnabled;

  const mutedGroupStyle = !canEditTimes
    ? {opacity: ds.opacity.disabled}
    : undefined;

  return (
    <ScrollView>
      <List.Section title="Time & Region">
        <List.Item title="Time zone" description={timezoneLabel} disabled />
      </List.Section>

      <List.Section title="Business Hours">
        {/* In Android settings, tapping the row usually toggles too */}
        <List.Item
          title="Use business hours"
          description="Limit availability to a daily time window"
          disabled={!canInteract}
          right={(props) => (
            <View style={props.style}>
              <Switch
                value={businessHoursEnabled}
                onValueChange={
                  !canInteract
                    ? undefined
                    : (v) => void handleToggleBusinessHours(v)
                }
                elementColors={{
                  checkedTrackColor: Palette.bluepurple,
                  checkedThumbColor: Palette.white,
                }}
              />
            </View>
          )}
        />

        <View style={mutedGroupStyle}>
          <List.Item
            title="Start time"
            description={
              canEditTimes ? startTimeLabel : 'Turn on business hours to edit'
            }
            disabled={!canEditTimes}
            onPress={
              canEditTimes
                ? () => openTimePicker('business_hour_start')
                : undefined
            }
            right={(props) => <List.Icon {...props} icon="clock-start" />}
            borderless
          />

          <List.Item
            title="End time"
            description={
              canEditTimes ? endTimeLabel : 'Turn on business hours to edit'
            }
            disabled={!canEditTimes}
            onPress={
              canEditTimes
                ? () => openTimePicker('business_hour_end')
                : undefined
            }
            right={(props) => <List.Icon {...props} icon="clock-end" />}
            borderless
          />
        </View>
      </List.Section>

      {activeTimePicker && (
        <DatePicker
          key={activeTimePicker.field}
          initialDate={activeTimePickerDate}
          mode="time"
          onDateSelected={(date) =>
            handleTimeSelected(activeTimePicker.field, date)
          }
          onDismiss={dismissTimePicker}
          confirmText="Save"
          dismissText="Cancel"
          modifiers={[
            dialogBackground(theme.modalBackground),
            tintColor(Palette.bluepurple),
          ]}
        />
      )}
    </ScrollView>
  );
}
