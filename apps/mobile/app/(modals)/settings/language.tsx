import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedView, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function LanguageScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>App Language</ThemedText>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: ds.spacing.xl,
      },
      text: {
        ...ds.typography.sectionTitle,
        color: theme.text,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
