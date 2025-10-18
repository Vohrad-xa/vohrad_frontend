import React from 'react';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedView, ModalScrollView} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {OrganizationContent} from '@/features/settings/organization';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function OrganizationScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <OrganizationContent />
      </ModalScrollView>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, insetBottom: number) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      content: {
        gap: ds.spacing.xxl,
        paddingBottom: ds.spacing.xxxl + insetBottom + ds.spacing.lg,
      },
    }),
  (ds, theme, insetBottom) => themeKey(theme, ds) + `|${insetBottom}`,
);
