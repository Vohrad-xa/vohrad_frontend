// profile.tsx
import React, {useRef} from 'react';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedView, ModalScrollView, ThemedButton} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {
  ProfileContentEditable,
  type ProfileContentHandle,
} from '@/features/settings/profile/profile-content';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function ProfileScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const profileContentRef = useRef<ProfileContentHandle>(null);

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <ProfileContentEditable
          ref={profileContentRef}
          showInlineSaveButton={false}
        />
      </ModalScrollView>
      <ThemedView style={styles.footer}>
        <ThemedButton
          title="Save Profile"
          variant="primary"
          onPress={() => profileContentRef.current?.saveProfile()}
        />
      </ThemedView>
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
      footer: {
        paddingHorizontal: ds.spacing.xl,
        paddingTop: ds.spacing.md,
        paddingBottom: insetBottom + ds.spacing.md,
        backgroundColor: theme.background,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.border,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
