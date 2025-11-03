import React from 'react';
import {Keyboard, Platform, Pressable, StyleSheet, View} from 'react-native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';
import type {TrackingMode} from '@vohrad/types';

const TRACKING_MODE_OPTIONS = [
  {label: 'Abstract', value: 'abstract' as const},
  {label: 'Standard', value: 'standard' as const},
  {label: 'Serialized', value: 'serialized' as const},
];

const TRACKING_MODE_LABEL_LOOKUP = TRACKING_MODE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<TrackingMode, string>,
);

interface TrackingModeFieldProps {
  trackingMode?: TrackingMode;
  onValueChange?: (value: TrackingMode) => void;
}

const TrackingModeFieldComponent = ({
  trackingMode,
  onValueChange,
}: TrackingModeFieldProps) => {
  const {ds, theme, scheme: _scheme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const {showActionSheetWithOptions} = useActionSheet();
  const styles = createStyles(ds, theme);

  const handleSelectTrackingMode = () => {
    Keyboard.dismiss();

    const options = TRACKING_MODE_OPTIONS.map((option) => option.label);
    const cancelButtonIndex = options.length;
    const actionSheetOptions = [...options, 'Cancel'];

    showActionSheetWithOptions(
      {
        title: 'Tracking Mode',
        options: actionSheetOptions,
        cancelButtonIndex,
        destructiveButtonIndex: cancelButtonIndex,
        ...(Platform.OS !== 'ios'
          ? {
              containerStyle: {
                paddingBottom: ds.spacing.xxxl,
                backgroundColor: theme.background,
              },
              textStyle: {
                color: theme.text,
              },
              titleTextStyle: {
                color: theme.muted,
              },
            }
          : {}),
      },
      (selectedIndex) => {
        if (
          selectedIndex === undefined ||
          selectedIndex === cancelButtonIndex
        ) {
          return;
        }

        const selected = TRACKING_MODE_OPTIONS[selectedIndex];
        if (selected) {
          triggerHaptic('selection');
          onValueChange?.(selected.value);
        }
      },
    );
  };

  return (
    <Pressable
      style={styles.fieldRow}
      onPress={handleSelectTrackingMode}
      accessibilityRole="button"
      accessibilityLabel="Select tracking mode"
    >
      <ThemedText variant="label" style={styles.fieldLabel}>
        Tracking Mode
      </ThemedText>
      <View style={styles.trackingModeValue}>
        <ThemedText variant="value" style={styles.valueText}>
          {TRACKING_MODE_LABEL_LOOKUP[trackingMode ?? 'abstract'] ?? 'Abstract'}
        </ThemedText>
        <Icon
          name="chevron-forward-outline"
          size="md"
          colorToken="muted"
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );
};

TrackingModeFieldComponent.displayName = 'TrackingModeField';

export const TrackingModeField = React.memo(TrackingModeFieldComponent);

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      fieldLabel: {
        flex: 1,
      },
      trackingModeValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
      },
      valueText: {
        color: theme.muted,
      },
      chevron: {},
    }),
  (ds, theme) => themeKey(theme, ds),
);
