import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedView, ThemedText} from '@/components/ui';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';
type ThemeType = ReturnType<typeof useTheme>['theme'];

export default function SupportScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>Report an Issue</ThemedText>
    </ThemedView>
  );
}

const createStyles = (ds: typeof DesignSystem, theme: ThemeType) =>
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
  });
