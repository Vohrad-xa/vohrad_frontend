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
      <List.Section style={styles.section}>
        <Surface style={styles.topSurface} mode="flat">
          <List.Item
            style={styles.listItem}
            title="Biometric Unlock"
            description="Enable Face ID / Fingerprint"
            right={() => <BiometricToggle />}
          />
        </Surface>

        {Platform.OS !== 'web' && (
          <Surface style={[styles.bottomSurface]} mode="flat">
            <List.Item
              style={styles.listItem}
              title="Haptic Feedback"
              description="Enable haptic feedback"
              right={() => <HapticToggle />}
            />
          </Surface>
        )}
      </List.Section>
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

      section: {
        gap: ds.spacing.xxs,
      },

      topSurface: {
        borderTopLeftRadius: ds.borderRadius.xxxl,
        borderTopRightRadius: ds.borderRadius.xxxl,
      },

      bottomSurface: {
        borderBottomLeftRadius: ds.borderRadius.xxxl,
        borderBottomRightRadius: ds.borderRadius.xxxl,
      },

      listItem: {
        paddingRight: ds.spacing.sm,
      },
    }),
  (ds, theme) => themeKey(theme, ds),
);
