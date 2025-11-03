import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText} from '@/components/ui';
import type {InfoField} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

interface QuantityFieldProps {
  field: InfoField;
  value?: string;
}

export function QuantityField({field, value}: QuantityFieldProps) {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const handlePress = () => {
    router.push('/items/quantity');
  };

  return (
    <Pressable
      style={styles.fieldRow}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="View quantity details"
    >
      <ThemedText variant="label" style={styles.fieldLabel}>
        {field.label}
      </ThemedText>
      <View style={styles.valueContainer}>
        <ThemedText variant="value" style={styles.valueText}>
          {value ?? '0'}
        </ThemedText>
        <Icon
          name="chevron-forward-outline"
          size="md"
          style={styles.valueText}
        />
      </View>
    </Pressable>
  );
}

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
      valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ds.spacing.sm,
        color: theme.muted,
      },
      valueText: {
        color: theme.muted,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
