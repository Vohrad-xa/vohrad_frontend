import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {Icon} from '@/utils/icons';
import {makeStyleFactory} from '@/utils/style-factory';

interface LocationsProps {
  itemId?: string;
}

export function Locations({itemId}: LocationsProps): React.JSX.Element {
  const {ds, theme} = useTheme();
  const router = useRouter();
  const styles = createStyles(ds, theme);

  const handlePress = () => {
    router.push({
      pathname: '/items/location',
      params: {id: itemId},
    });
  };

  return (
    <Pressable
      style={styles.fieldRow}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="View locations"
    >
      <ThemedText variant="label" style={styles.fieldLabel}>
        Locations
      </ThemedText>
      <View style={styles.valueContainer}>
        <Icon name="chevron-forward-outline" size="md" colorToken="muted" />
      </View>
    </Pressable>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
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
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
