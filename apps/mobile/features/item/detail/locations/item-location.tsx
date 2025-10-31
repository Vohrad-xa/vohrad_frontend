import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {Card} from '@/components/cards/card';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useItemDetail} from '@/features/item';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export function ItemLocation() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);
  const {id: itemId} = useLocalSearchParams<{id: string}>();
  const {item} = useItemDetail(itemId);

  const displayLocations = item?.locations ?? [];

  return (
    <View style={{gap: ds.spacing.xl}}>
      {displayLocations.map((location) => (
        <View key={location.id} style={{gap: ds.spacing.sm}}>
          <ThemedText variant="heading" style={styles.locationTitle}>
            {location.name}
          </ThemedText>
          <Card withDivider>
            <View style={styles.fieldRow}>
              <ThemedText variant="label" style={styles.fieldLabel}>
                Code
              </ThemedText>
              <ThemedText variant="secondary">{location.code}</ThemedText>
            </View>

            <View style={styles.fieldRow}>
              <ThemedText variant="label" style={styles.fieldLabel}>
                Quantity
              </ThemedText>
              <ThemedText variant="secondary">{location.quantity}</ThemedText>
            </View>
          </Card>
        </View>
      ))}
    </View>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      locationTitle: {
        paddingHorizontal: ds.spacing.lg,
      },
      fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      fieldLabel: {
        flexShrink: 0,
        marginRight: ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
