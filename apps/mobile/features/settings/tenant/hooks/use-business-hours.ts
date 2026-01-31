import {useCallback, useMemo, useState} from 'react';
import {useTenantManager, useUpdateTenantSettings} from '@sykamore/store';
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

const DEFAULT_BUSINESS_HOUR_START = '09:00';
const DEFAULT_BUSINESS_HOUR_END = '17:00';

/**
 * Business hours UI logic.
 */
export function useBusinessHours() {
  const {tenant: organization} = useTenantManager();
  const {mutateAsync: updateTenantSettings, isPending: isLoading} =
    useUpdateTenantSettings();

  const [activeTimePicker, setActiveTimePicker] =
    useState<ActiveTimePicker>(null);

  const organizationTimezone = organization?.timezone ?? '';
  const businessHourStart = organization?.business_hour_start ?? '';
  const businessHourEnd = organization?.business_hour_end ?? '';
  const businessHoursEnabled = Boolean(businessHourStart ?? businessHourEnd);

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
    async (field: BusinessHourField, date: Date | null) => {
      if (date) {
        const nextValue = formatTimeInput(date);
        const currentValue =
          field === 'business_hour_start' ? businessHourStart : businessHourEnd;

        if (currentValue !== nextValue) {
          await updateTenantSettings({[field]: nextValue}).catch(
            () => undefined,
          );
        }
      }
      setActiveTimePicker(null);
    },
    [businessHourEnd, businessHourStart, updateTenantSettings],
  );

  const dismissTimePicker = useCallback(() => {
    setActiveTimePicker(null);
  }, []);

  const toggleBusinessHours = useCallback(
    async (enabled: boolean) => {
      if (!enabled) {
        await updateTenantSettings({
          business_hour_start: null,
          business_hour_end: null,
        });
      } else {
        await updateTenantSettings({
          business_hour_start: businessHourStart ?? DEFAULT_BUSINESS_HOUR_START,
          business_hour_end: businessHourEnd ?? DEFAULT_BUSINESS_HOUR_END,
        });
      }
    },
    [businessHourEnd, businessHourStart, updateTenantSettings],
  );

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
