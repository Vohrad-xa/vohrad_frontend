import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText, Toggle} from '@/components/ui';
import {type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import type {TrackingMode} from '@vohrad/types';

interface TrackingModeFilterProps {
  trackingModes: TrackingMode[];
  toggleTrackingMode: (mode: TrackingMode) => void;
}

export function TrackingModeFilter({
  trackingModes,
  toggleTrackingMode,
}: TrackingModeFilterProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.section}>
      <ThemedText variant="heading" style={styles.sectionTitle}>
        Tracking Mode
      </ThemedText>
      <Card withDivider>
        <View style={styles.filterRow}>
          <ThemedText variant="label">Abstract</ThemedText>
          <Toggle
            value={trackingModes.includes('abstract')}
            onValueChange={() => toggleTrackingMode('abstract')}
            accessibilityLabel="Filter abstract tracking mode"
          />
        </View>

        <View style={styles.filterRow}>
          <ThemedText variant="label">Standard</ThemedText>
          <Toggle
            value={trackingModes.includes('standard')}
            onValueChange={() => toggleTrackingMode('standard')}
            accessibilityLabel="Filter standard tracking mode"
          />
        </View>

        <View style={styles.filterRow}>
          <ThemedText variant="label">Serialized</ThemedText>
          <Toggle
            value={trackingModes.includes('serialized')}
            onValueChange={() => toggleTrackingMode('serialized')}
            accessibilityLabel="Filter serialized tracking mode"
          />
        </View>
      </Card>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      section: {
        gap: ds.spacing.sm,
      },
      sectionTitle: {
        paddingLeft: ds.spacing.lg,
      },
      filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    }),
  (ds, theme) => `${ds.version}|${theme.version}`,
);
