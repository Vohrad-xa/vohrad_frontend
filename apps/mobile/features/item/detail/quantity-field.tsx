import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/ui';
import type {InfoField} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface QuantityFieldProps {
  field: InfoField;
  value?: string;
}

export function QuantityField({value}: QuantityFieldProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.fieldRow}>
      <ThemedText variant="label" style={styles.fieldLabel}>
        Total Quantity
      </ThemedText>
      <ThemedText variant="value">{value ?? '0'}</ThemedText>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      fieldLabel: {
        flex: 1,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
