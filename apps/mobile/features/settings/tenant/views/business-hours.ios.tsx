import React, {useCallback, useMemo} from 'react';
import {
  Host,
  List,
  Section,
  Text,
  LabeledContent,
  Toggle,
  DatePicker,
  HStack,
  Spacer,
  foregroundStyle,
} from '@/modules/sykamore-ui';
import {useHaptic} from '@/providers';
import {AppIcons, Icon} from '@/utils';
import {useBusinessHours} from '../hooks/use-business-hours';

function timeStringToDate(timeStr: string): Date {
  const base = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number) as [number, number];
  if (Number.isFinite(hours) && Number.isFinite(minutes)) {
    base.setHours(hours, minutes, 0, 0);
  }
  return base;
}

export function BusinessHours() {
  const {triggerHaptic} = useHaptic();

  const {
    businessHoursEnabled,
    businessHourStart,
    businessHourEnd,
    handleTimeSelected,
    organizationTimezone,
    toggleBusinessHours,
  } = useBusinessHours();

  const timezoneLabel = organizationTimezone.length
    ? organizationTimezone
    : 'Not set';

  const startDate = useMemo(
    () =>
      timeStringToDate(businessHourStart.length ? businessHourStart : '09:00'),
    [businessHourStart],
  );

  const endDate = useMemo(
    () => timeStringToDate(businessHourEnd.length ? businessHourEnd : '17:00'),
    [businessHourEnd],
  );

  const handleToggle = useCallback(
    async (isOn: boolean) => {
      if (isOn === businessHoursEnabled) return;
      triggerHaptic('light');
      await toggleBusinessHours(isOn);
    },
    [businessHoursEnabled, toggleBusinessHours, triggerHaptic],
  );

  const onStartChange = useCallback(
    (date: Date) => void handleTimeSelected('business_hour_start', date),
    [handleTimeSelected],
  );

  const onEndChange = useCallback(
    (date: Date) => void handleTimeSelected('business_hour_end', date),
    [handleTimeSelected],
  );

  return (
    <Host style={{flex: 1}}>
      <List listStyle="automatic">
        <Section
          title="Region"
          footer={
            <Text>
              Time zone is set automatically based on your organization&apos;s
              location.
            </Text>
          }
        >
          <LabeledContent label="Time Zone">
            <Text modifiers={[foregroundStyle('secondary')]}>
              {timezoneLabel}
            </Text>
          </LabeledContent>
        </Section>

        <Section
          title="Business Hours"
          footer={
            <Text>
              This feature allows you to set a time window during which your
              team is expected to be working. Outside of these hours, actions
              like adding new tasks or updating existing ones will be disabled.
            </Text>
          }
        >
          <Toggle
            label="Time Window"
            isOn={businessHoursEnabled}
            onIsOnChange={handleToggle}
          />
          {businessHoursEnabled && (
            <HStack alignment="center">
              <DatePicker
                selection={startDate}
                displayedComponents={['hourAndMinute']}
                onDateChange={onStartChange}
              />

              <Spacer />

              <Icon
                useSwiftUI
                name={AppIcons.ui.time}
                colorToken="accentBlue"
                size="lg"
              />

              <Spacer />

              <DatePicker
                selection={endDate}
                displayedComponents={['hourAndMinute']}
                onDateChange={onEndChange}
              />
            </HStack>
          )}
        </Section>
      </List>
    </Host>
  );
}
