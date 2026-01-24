import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Surface} from 'react-native-paper';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {BiometricToggle, HapticToggle} from '@/features/settings';
import {useTheme} from '@/providers';
import {makeStyleFactory} from '@/utils';

export default function AppSettingsScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.card} elevation={1} mode="flat">
        <List.Item
          style={styles.listItem}
          title="Biometric Unlock"
          description="Enable Face ID / Fingerprint"
          right={() => <BiometricToggle />}
        />

        {Platform.OS !== 'web' && (
          <List.Item
            style={styles.listItem}
            title="Haptic Feedback"
            description="Enable haptic feedback"
            right={() => <HapticToggle />}
          />
        )}
      </Surface>
    </ScrollView>
  );
}

const createStyles = makeStyleFactory(
  (ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: ds.spacing.md,
      },

      card: {
        borderRadius: ds.borderRadius.xxxl,
      },

      listItem: {
        paddingRight: ds.spacing.sm,
        paddingTop: ds.spacing.xs,
        paddingBottom: ds.spacing.xs,
      },

      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
