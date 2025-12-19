import React from 'react';
import {StyleSheet, Platform, View} from 'react-native';
import {Card} from '@/components/cards/card';
import {ModalScrollView, ThemedText} from '@/components/ui';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {BiometricToggle, HapticToggle} from '@/features/settings';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';
import {AppIcons} from '@/utils/icons';

export default function AppSettingsScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ModalScrollView contentContainerStyle={styles.container}>
      {/* Biometric Unlock Setting */}
      <Card>
        <Card.Row icon={AppIcons.settings.biometric} hideChevron>
          <View style={styles.rowContent}>
            <ThemedText variant="label">Biometric Unlock</ThemedText>
            <BiometricToggle />
          </View>
        </Card.Row>
      </Card>
      <ThemedText variant="caption" style={styles.description}>
        Use your device&apos;s biometric authentication (e.g., fingerprint or
        face recognition) to unlock the app.
      </ThemedText>

      {/* Haptic Feedback Setting */}
      {Platform.OS !== 'web' && (
        <Card>
          <Card.Row icon={AppIcons.settings.haptic} hideChevron>
            <View style={styles.rowContent}>
              <ThemedText variant="label">Haptic Feedback</ThemedText>
              <HapticToggle />
            </View>
          </Card.Row>
        </Card>
      )}
      {Platform.OS !== 'web' && (
        <ThemedText variant="caption" style={styles.description}>
          Enable haptic feedback to receive tactile responses for certain
          actions within the app.
        </ThemedText>
      )}
    </ModalScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        gap: ds.spacing.xl,
      },
      rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        height: ds.spacing.xl,
      },
      description: {
        paddingHorizontal: ds.spacing.xl,
        marginTop: -ds.spacing.md,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
