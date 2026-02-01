import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {List, Surface, Divider} from 'react-native-paper';
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
      <Surface mode="flat" style={styles.surface}>
        <List.Item
          style={styles.listItem}
          title="Biometric Unlock"
          description="Enable Face ID / Fingerprint"
          right={() => <BiometricToggle />}
        />

        <Divider style={styles.divider} />

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
  (ds: DSShape, theme: ThemeShape) =>
    StyleSheet.create({
      container: {
        flex: 1,
        padding: ds.spacing.md,
      },

      surface: {
        borderRadius: ds.borderRadius.xxxl,
        overflow: 'hidden',
        backgroundColor: 'transparent',
      },

      listItem: {
        paddingRight: ds.spacing.md,
        borderRadius: ds.borderRadius.sm,
        backgroundColor: theme.card,
      },

      divider: {
        height: 1.9,
        backgroundColor: 'transparent',
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
