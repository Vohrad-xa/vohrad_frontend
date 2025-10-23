import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {useNavigation} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemedView, ModalScrollView, InfoRowCard} from '@/components/ui';
import type {InfoField} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {BiometricToggle, HapticToggle} from '@/features/settings/app-settings';
import {useSettingsHeader} from '@/hooks';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils/style-factory';

export default function AppSettingsScreen() {
  const {ds, theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(ds, theme, insets.bottom);
  const navigation = useNavigation();

  useSettingsHeader({
    navigation,
    isEditing: false,
    hasChanges: false,
    onSave: () => {},
  });

  const securityFields: InfoField[] = [
    {
      key: 'biometric_unlock',
      label: 'Biometric Unlock',
      span: 'full',
      renderAccessory: <BiometricToggle />,
    },
  ];

  const feedbackFields: InfoField[] =
    Platform.OS !== 'web'
      ? [
          {
            key: 'haptic_feedback',
            label: 'Haptic Feedback',
            span: 'full',
            renderAccessory: <HapticToggle />,
          },
        ]
      : [];

  return (
    <ThemedView style={styles.container}>
      <ModalScrollView contentContainerStyle={styles.content}>
        <InfoRowCard fields={securityFields} editable={false} values={{}} />
        {Platform.OS !== 'web' && (
          <InfoRowCard fields={feedbackFields} editable={false} values={{}} />
        )}
      </ModalScrollView>
    </ThemedView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, theme: ThemeShape, insetBottom: number) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor:
          Platform.OS === 'web' ? theme.background : theme.secondbackground,
      },
      content: {
        gap: ds.spacing.xl,
        paddingTop: ds.spacing.md,
        paddingBottom: ds.spacing.xxl + insetBottom,
      },
    }),
  (ds, theme, insetBottom) => themeKey(theme, ds) + `|${insetBottom}`,
);
