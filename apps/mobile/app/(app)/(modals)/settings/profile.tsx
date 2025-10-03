import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import type {DesignSystem} from '@/constants/typography';
import {ThemedView} from '@/components/ui';
import {useTheme} from '@/providers';
import {ProfileContent} from '@/features/settings/profile';
type ThemeType = ReturnType<typeof useTheme>['theme'];

export default function ProfileScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
        contentInsetAdjustmentBehavior="automatic"
      >
        <ProfileContent />
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (ds: typeof DesignSystem, theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      gap: ds.spacing.xxl,
    },
  });
