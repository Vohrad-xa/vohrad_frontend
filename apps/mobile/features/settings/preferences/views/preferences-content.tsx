import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet} from 'react-native';
import {usePreferencesManager} from '@sykamore/store';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Surface} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {showConfirmAlert, showAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';
import {DatePicker, Switch} from 'sykamore-ui/android';

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

export const PreferencesContentEditable = forwardRef<
  PreferencesContentHandle,
  PreferencesContentEditableProps
>(({isEditing, onSaveComplete, onFieldChange}, ref) => {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const styles = createStyles(ds, theme);

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

  const isEditable = isEditing;
  const timezoneLabel = organization.timezone?.length
    ? organization.timezone
    : '—';
  const startTimeLabel = preferences.business_hour_start?.length
    ? preferences.business_hour_start
    : '—';
  const endTimeLabel = preferences.business_hour_end?.length
    ? preferences.business_hour_end
    : '—';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Surface style={styles.surface} elevation={1} mode="flat">
        <List.Item
          title="Timezone"
          description={timezoneLabel}
          disabled
          borderless
        />

        <List.Item
          title="Business Hours"
          style={styles.listItem}
          description={businessHoursEnabled ? 'Enabled' : 'Disabled'}
          right={() => (
            <Switch
              scale={0.85}
              value={businessHoursEnabled}
              onValueChange={
                !isEditable || isLoading
                  ? undefined
                  : (value) => {
                      void handleToggleBusinessHours(value);
                    }
              }
            />
          )}
          borderless
        />
      </Surface>

      {businessHoursEnabled && (
        <Surface style={styles.surface} elevation={1} mode="flat">
          <List.Item
            title="Start Time"
            style={styles.listItem}
            description={startTimeLabel}
            onPress={() =>
              handleOpenTimePicker(
                'business_hour_start',
                preferences.business_hour_start ?? null,
              )
            }
            right={(props) => <List.Icon {...props} icon="clock-outline" />}
            borderless
          />
          <List.Item
            title="End Time"
            style={styles.listItem}
            description={endTimeLabel}
            onPress={() =>
              handleOpenTimePicker(
                'business_hour_end',
                preferences.business_hour_end ?? null,
              )
            }
            right={(props) => <List.Icon {...props} icon="clock-outline" />}
            borderless
          />
        </Surface>
      )}

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
        />
      )}
    </ScrollView>
  );
});

PreferencesContentEditable.displayName = 'PreferencesContentEditable';

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        padding: ds.spacing.md,
        gap: ds.spacing.lg,
      },
      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
      },
      listItem: {
        paddingRight: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
