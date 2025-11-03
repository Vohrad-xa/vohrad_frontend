import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText, Toggle} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface StatusFilterProps {
  statuses: Array<'active' | 'inactive'>;
  toggleStatus: (status: 'active' | 'inactive') => void;
}

export function StatusFilter({statuses, toggleStatus}: StatusFilterProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.section}>
      <ThemedText variant="heading" style={styles.sectionTitle}>
        Status
      </ThemedText>
      <Card withDivider>
        <View style={styles.filterRow}>
          <ThemedText variant="label">Active</ThemedText>
          <Toggle
            value={statuses.includes('active')}
            onValueChange={() => toggleStatus('active')}
            accessibilityLabel="Filter active items"
          />
        </View>

        <View style={styles.filterRow}>
          <ThemedText variant="label">Inactive</ThemedText>
          <Toggle
            value={statuses.includes('inactive')}
            onValueChange={() => toggleStatus('inactive')}
            accessibilityLabel="Filter inactive items"
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
  (ds, theme) => themeKey(theme, ds),
);
