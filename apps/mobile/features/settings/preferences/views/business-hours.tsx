import React, {forwardRef, useImperativeHandle} from 'react';
import {View} from 'react-native';
import {usePreferencesManager} from '@sykamore/store';
import {ScrollView} from 'react-native-gesture-handler';
import {List} from 'react-native-paper';
import {Palette} from '@/constants';
import {useTheme, useHaptic} from '@/providers';
import {showConfirmAlert, showAlert} from '@/utils';
import {DatePicker, Switch} from 'sykamore-ui/android';
import {dialogBackground, tintColor} from 'sykamore-ui/android/modifiers';

export type SavePreferencesOptions = {
  skipConfirm?: boolean;
};

export type PreferencesContentHandle = {
  savePreferences: (options?: SavePreferencesOptions) => void;
  hasChanges: () => boolean;
};

type PreferencesContentEditableProps = {
  isEditing: boolean;
  onSaveComplete?: () => void;
  onFieldChange?: () => void;
};

type BusinessHourField = 'business_hour_start' | 'business_hour_end';

type ActiveTimePicker = {
  field: BusinessHourField;
  initialTime: string | null;
} | null;

const formatTimeValue = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const createTimeDate = (timeValue: string | null) => {
  const base = new Date();
  if (!timeValue) return base;

  const [hours, minutes] = timeValue.split(':').map((value) => Number(value));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return base;

  base.setHours(hours, minutes, 0, 0);
  return base;
};

export const BusinessHours = forwardRef<
  PreferencesContentHandle,
  PreferencesContentEditableProps
>(({isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {theme, ds} = useTheme();
  const {triggerHaptic} = useHaptic();

  const {
    organization,
    preferences,
    businessHoursEnabled,
    isLoading,
    updateField,
    toggleBusinessHours,
    hasChanges,
    submitUpdate,
  } = usePreferencesManager();

  const [activeTimePicker, setActiveTimePicker] =
    React.useState<ActiveTimePicker>(null);

  const performUpdate = async () => {
    if (!hasChanges()) {
      showAlert({
        title: 'No Changes Detected',
        message: 'Update a field before saving your preferences.',
      });
      return;
    }

    await submitUpdate();
    onSaveComplete?.();
  };

  const handleSavePreferences = (options?: SavePreferencesOptions) => {
    if (options?.skipConfirm) {
      void performUpdate();
      return;
    }

    showConfirmAlert({
      title: 'Update Preferences',
      message: 'Are you sure you want to save these changes?',
      confirmText: 'Save',
      cancelText: 'Discard',
      cancelIsDestructive: true,
      onConfirm: () => {
        performUpdate();
      },
    });
  };

  useImperativeHandle(ref, () => ({
    savePreferences: handleSavePreferences,
    hasChanges,
  }));

  React.useEffect(() => {
    onFieldChange?.();
  }, [preferences, businessHoursEnabled, onFieldChange]);

  const handleToggleBusinessHours = React.useCallback(
    async (enabled: boolean) => {
      triggerHaptic('light');
      await toggleBusinessHours(enabled);
    },
    [toggleBusinessHours, triggerHaptic],
  );

  const handleOpenTimePicker = React.useCallback(
    (field: BusinessHourField, currentValue: string | null) => {
      if (!isEditing || isLoading) return;
      setActiveTimePicker({field, initialTime: currentValue});
    },
    [isEditing, isLoading],
  );

  const handleTimeSelected = React.useCallback(
    (field: BusinessHourField, date: Date | null) => {
      if (date) {
        updateField(field, formatTimeValue(date));
      }
      setActiveTimePicker(null);
    },
    [updateField],
  );

  const handleTimeDismiss = React.useCallback(() => {
    setActiveTimePicker(null);
  }, []);

  const canInteract = isEditing && !isLoading;

  const timezoneLabel = organization.timezone?.length
    ? organization.timezone
    : 'Not set';

  const startTimeLabel = preferences.business_hour_start?.length
    ? preferences.business_hour_start
    : 'Not set';

  const endTimeLabel = preferences.business_hour_end?.length
    ? preferences.business_hour_end
    : 'Not set';

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
          onPress={
            canInteract
              ? () => void handleToggleBusinessHours(!businessHoursEnabled)
              : undefined
          }
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
                ? () =>
                    handleOpenTimePicker(
                      'business_hour_start',
                      preferences.business_hour_start ?? null,
                    )
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
                ? () =>
                    handleOpenTimePicker(
                      'business_hour_end',
                      preferences.business_hour_end ?? null,
                    )
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
          initialDate={createTimeDate(
            activeTimePicker.initialTime,
          ).toISOString()}
          mode="time"
          onDateSelected={(date) =>
            handleTimeSelected(activeTimePicker.field, date)
          }
          onDismiss={handleTimeDismiss}
          confirmText="Select"
          dismissText="Cancel"
          modifiers={[
            dialogBackground(theme.modalBackground),
            tintColor(Palette.bluepurple),
          ]}
        />
      )}
    </ScrollView>
  );
});

BusinessHours.displayName = 'BusinessHours';
