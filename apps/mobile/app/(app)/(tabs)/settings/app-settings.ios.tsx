import {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {themeKey, type DSShape, type ThemeShape} from '@/constants/theme';
import {useBiometricToggle} from '@/features/settings/app-settings/biometric';
import {Host, List, Switch, Section, Text} from '@/modules/sykamore-ui';
import {useTheme, useHaptic} from '@/providers';
import {AppIcons, Icon, makeStyleFactory} from '@/utils';

export default function AppSettingsScreen() {
  const {ds, theme} = useTheme();
  const styles = createStyles(ds, theme);

  const {
    isEnabled: biometricEnabled,
    isAvailable: biometricAvailable,
    loading: biometricLoading,
    handleToggle: toggleBiometric,
  } = useBiometricToggle();

  const {isEnabled: hapticEnabled, setEnabled: setHapticEnabled} = useHaptic();

  const handleBiometricChange = useCallback(
    (nextValue: boolean) => {
      if (biometricLoading || !biometricAvailable) {
        return;
      }
      void toggleBiometric(nextValue);
    },
    [biometricAvailable, biometricLoading, toggleBiometric],
  );

  const handleHapticChange = useCallback(
    (nextValue: boolean) => {
      setHapticEnabled(nextValue);
    },
    [setHapticEnabled],
  );

  return (
    <Host style={styles.host} matchContents>
      <List listStyle="insetGrouped" showScrollIndicators={false}>
        <Section
          footer={
            <Text>
              Use your device&apos;s biometric authentication (e.g., fingerprint
              or face recognition) to unlock the app.
            </Text>
          }
        >
          <Switch
            value={biometricEnabled}
            onValueChange={handleBiometricChange}
            label="Biometric Unlock"
            icon={
              <Icon
                name={AppIcons.settings.biometric}
                useSwiftUI
                colorToken="accentBlue"
              />
            }
          />
        </Section>

        <Section
          footer={
            <Text>
              Enable haptic feedback to receive tactile responses for certain
              actions within the app.
            </Text>
          }
        >
          <Switch
            value={hapticEnabled}
            onValueChange={handleHapticChange}
            label="Haptic Feedback"
            systemImage="iphone.radiowaves.left.and.right"
          />
        </Section>
      </List>
    </Host>
  );
}

const createStyles = makeStyleFactory(
  (_ds: DSShape, _theme: ThemeShape) =>
    StyleSheet.create({
      host: {
        flex: 1,
      },
    }),
  (_ds, _theme) => themeKey(_theme, _ds),
);
