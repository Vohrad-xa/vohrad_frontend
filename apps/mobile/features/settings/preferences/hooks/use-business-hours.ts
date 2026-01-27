import {useCallback, useMemo, useState} from 'react';
import {usePreferencesManager} from '@sykamore/store';
import {formatTimeInput} from '@/utils';

type BusinessHourField = 'business_hour_start' | 'business_hour_end';

type ActiveTimePicker = {
  field: BusinessHourField;
  initialTime: string | null;
} | null;

const createTimeDate = (timeValue: string | null) => {
  const base = new Date();
  if (!timeValue) return base;

  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return base;

  base.setHours(hours, minutes, 0, 0);
  return base;
};

export function useBusinessHours() {
  const {
    organization,
    preferences,
    businessHoursEnabled,
    isLoading,
    updateField,
    toggleBusinessHours,
    submitUpdate,
  } = usePreferencesManager();

  const [activeTimePicker, setActiveTimePicker] =
    useState<ActiveTimePicker>(null);

  const organizationTimezone = organization.timezone ?? '';
  const businessHourStart = preferences.business_hour_start ?? '';
  const businessHourEnd = preferences.business_hour_end ?? '';

  const activeTimePickerDate = useMemo(() => {
    if (!activeTimePicker) return null;
    return createTimeDate(activeTimePicker.initialTime).toISOString();
  }, [activeTimePicker]);

  const openTimePicker = useCallback(
    (field: BusinessHourField) => {
      const currentValue =
        field === 'business_hour_start' ? businessHourStart : businessHourEnd;
      setActiveTimePicker({
        field,
        initialTime: currentValue.length ? currentValue : null,
      });
    },
    [businessHourEnd, businessHourStart],
  );

  const handleTimeSelected = useCallback(
    (field: BusinessHourField, date: Date | null) => {
      if (date) {
        const nextValue = formatTimeInput(date);
        if (preferences[field] !== nextValue) {
          updateField(field, nextValue);
          void submitUpdate({[field]: nextValue}).catch(() => undefined);
        }
      }
      setActiveTimePicker(null);
    },
    [preferences, submitUpdate, updateField],
  );

  const dismissTimePicker = useCallback(() => {
    setActiveTimePicker(null);
  }, []);

  return {
    activeTimePicker,
    activeTimePickerDate,
    businessHoursEnabled,
    businessHourEnd,
    businessHourStart,
    dismissTimePicker,
    handleTimeSelected,
    isLoading,
    organizationTimezone,
    openTimePicker,
    toggleBusinessHours,
  };
}
