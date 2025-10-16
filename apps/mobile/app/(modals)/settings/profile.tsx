// profile.tsx
import React from 'react';
import {StyleSheet} from 'react-native';
import type {DesignSystem} from '@/constants/typography';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {useTheme} from '@/providers';
import {ProfileContentEditable} from '@/features/settings/profile/profile-content';

type ThemeType = ReturnType<typeof useTheme>['theme'];

export default function ProfileScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <ProfileContentEditable />
      </ModalScrollView>
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
