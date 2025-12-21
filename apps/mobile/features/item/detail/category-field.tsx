import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import type {Category} from '@sykamore/types';

interface CategoryFieldProps {
  category?: Category | null;
}

const CategoryFieldComponent = ({category}: CategoryFieldProps) => {
  const {ds, theme: _theme} = useTheme();
  const styles = createStyles(ds, _theme);

  return (
    <View style={styles.fieldRow}>
      <ThemedText variant="label" style={styles.fieldLabel}>
        Category
      </ThemedText>
      <ThemedText variant="value">{category?.name ?? 'None'}</ThemedText>
    </View>
  );
};

CategoryFieldComponent.displayName = 'CategoryField';

export const CategoryField = React.memo(CategoryFieldComponent);

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
