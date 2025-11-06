import React, {forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {usePreferencesManager} from '@vohrad/store';
import {
  ThemedText,
  InfoRowCard,
  Toggle,
  EmptyState,
  type InfoField,
} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {showConfirmAlert, showAlert} from '@/utils';
import {makeStyleFactory} from '@/utils/style-factory';

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

  if (!organization) {
    return <EmptyState message="No organization information available" />;
  }

  const isEditable = isEditing || Platform.OS === 'web';

  const localizationFields: InfoField[] = [
    {
      key: 'timezone',
      label: 'Timezone',
      placeholder: 'e.g., America/New_York',
      value: organization.timezone,
      span: 'full',
    },
    {
      key: 'business_hours_toggle',
      label: 'Business Hours',
      span: 'full',
      renderAccessory: (
        <Toggle
          value={businessHoursEnabled}
          onValueChange={(value) => {
            void handleToggleBusinessHours(value);
          }}
          disabled={!isEditable || isLoading}
          accessibilityLabel="Toggle business hours scheduling"
          testID="business-hours-toggle"
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText variant="heading" style={styles.sectionTitle}>
            Localization
          </ThemedText>
        </View>
        <InfoRowCard
          fields={localizationFields}
          editable={isEditable}
          values={preferences}
          onFieldChange={updateField}
          autoFocus={Platform.OS === 'web'}
        />

        {businessHoursEnabled && (
          <InfoRowCard
            fields={[
              {
                key: 'business_hour_start',
                label: 'Start Time',
                placeholder: 'Select time',
                value: organization.business_hour_start,
                type: 'time',
                span: 'half',
              },
              {
                key: 'business_hour_end',
                label: 'End Time',
                placeholder: 'Select time',
                value: organization.business_hour_end,
                type: 'time',
                span: 'half',
              },
            ]}
            editable={isEditable}
            values={preferences}
            onFieldChange={updateField}
            autoFocus={false}
          />
        )}

        <ThemedText variant="caption" style={styles.caption}>
          Toggle to enable, adjust start and end times as needed then save your
          preferences, the software will be locked outside of these hours.
        </ThemedText>
      </View>
    </View>
  );
});

PreferencesContentEditable.displayName = 'PreferencesContentEditable';

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.xl,
        paddingTop: ds.spacing.md,
      },
      section: {
        gap: ds.spacing.md,
      },
      sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      sectionTitle: {
        ...ds.typography.heading,
        paddingHorizontal: Platform.OS === 'web' ? 0 : ds.spacing.xl,
      },
      disabledText: {
        textAlign: 'center',
        color: theme.muted,
      },
      caption: {
        paddingHorizontal: ds.spacing.xl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
