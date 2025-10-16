// profile.tsx
import React from 'react';
import {StyleSheet} from 'react-native';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {useTheme} from '@/providers';
import {ProfileContentEditable} from '@/features/settings/profile/profile-content';
import {makeStyleFactory} from '@/utils/style-factory';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';

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

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      content: {
        gap: ds.spacing.xxl,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
