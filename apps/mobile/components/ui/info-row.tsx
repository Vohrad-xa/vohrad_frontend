import React from 'react';
import {StyleSheet, View} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';
import {ThemedText} from './themed-text';

type InfoRowProps = {
  label: string;
  value?: string | null;
};

export const InfoRow: React.FC<InfoRowProps> = ({label, value}) => {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <View style={styles.row}>
      <ThemedText variant="label" colorToken="label">
        {label}
      </ThemedText>
      <ThemedText
        variant="body"
        colorToken="muted"
        style={!value && styles.emptyValue}
      >
        {value ?? 'Not set'}
      </ThemedText>
    </View>
  );
};

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: ds.spacing.md,
      },
      emptyValue: {
        fontStyle: 'italic',
        opacity: ds.opacity.disabled,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
