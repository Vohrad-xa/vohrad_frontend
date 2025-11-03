import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ThemedText, Slider} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

interface PriceRangeFilterProps {
  priceMin: number | null;
  priceMax: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  minLimit?: number;
  maxLimit?: number;
}

export function PriceRangeFilter({
  priceMin,
  priceMax,
  onMinChange,
  onMaxChange,
  minLimit = 0,
  maxLimit = 10000,
}: PriceRangeFilterProps) {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.section}>
      <ThemedText variant="heading" style={styles.sectionTitle}>
        Pice Range
      </ThemedText>
      <Card>
        <View style={styles.sliderContainer}>
          <View style={styles.labelRow}>
            <ThemedText variant="secondary" style={styles.label}>
              Min
            </ThemedText>
            <ThemedText variant="secondary" style={styles.value}>
              €{priceMin?.toFixed(2) ?? minLimit.toFixed(2)}
            </ThemedText>
          </View>
          <Slider
            value={priceMin ?? minLimit}
            onValueChange={onMinChange}
            minimumValue={minLimit}
            maximumValue={priceMax ?? maxLimit}
            step={5}
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.labelRow}>
            <ThemedText variant="label" style={styles.label}>
              Max
            </ThemedText>
            <ThemedText variant="secondary" style={styles.value}>
              €{priceMax?.toFixed(2) ?? maxLimit.toFixed(2)}
            </ThemedText>
          </View>
          <Slider
            value={priceMax ?? maxLimit}
            onValueChange={onMaxChange}
            minimumValue={priceMin ?? minLimit}
            maximumValue={maxLimit}
            step={10}
          />
        </View>
      </Card>
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      section: {
        gap: ds.spacing.sm,
      },
      sectionTitle: {
        paddingLeft: ds.spacing.lg,
      },
      sliderContainer: {
        gap: ds.spacing.sm,
      },
      labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      label: {
        color: theme.muted,
      },
      value: {
        color: theme.text,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
