import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedView, ThemedText} from '@/components/ui';
import type {Tokens} from '@/constants/colors';
import type {DesignSystem} from '@/constants/typography';
import {useTheme} from '@/providers';

export default function LanguageScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>App Language</ThemedText>
    </ThemedView>
  );
}

const createStyles = (ds: typeof DesignSystem, theme: typeof Tokens.light | typeof Tokens.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: ds.spacing.xl,
    },
    text: {
      ...ds.typography.title1,
      color: theme.text,
    },
  });
