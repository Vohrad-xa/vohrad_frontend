import React from 'react';
import {Keyboard, Platform, StyleSheet, View} from 'react-native';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme, useHaptic} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import type {TrackingMode} from '@vohrad/types';

const TRACKING_MODE_OPTIONS = [
  {label: 'Abstract', value: 'abstract' as const},
  {label: 'Lot', value: 'lot' as const},
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
  onPressHandler?: (handler: () => void) => void;
}

export function useTrackingModePress(
  trackingMode?: TrackingMode,
  onValueChange?: (value: TrackingMode) => void,
) {
  const {ds, theme} = useTheme();
  const {triggerHaptic} = useHaptic();
  const {showActionSheetWithOptions} = useActionSheet();

  return () => {
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
                borderRadius: ds.components.card.borderRadius,
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
}

const TrackingModeFieldComponent = ({
  trackingMode,
  onValueChange: _onValueChange,
  onPressHandler: _onPressHandler,
}: TrackingModeFieldProps) => {
  const {ds, theme: _theme} = useTheme();
  const styles = createStyles(ds, _theme);

  return (
    <View style={styles.fieldRow}>
      <ThemedText variant="label" style={styles.fieldLabel}>
        Tracking Mode
      </ThemedText>
      <ThemedText variant="value">
        {TRACKING_MODE_LABEL_LOOKUP[trackingMode ?? 'abstract'] ?? 'Abstract'}
      </ThemedText>
    </View>
  );
};

TrackingModeFieldComponent.displayName = 'TrackingModeField';

export const TrackingModeField = React.memo(TrackingModeFieldComponent);

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      },
      fieldLabel: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
