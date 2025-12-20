import {useCallback} from 'react';
import {useBiometricToggle} from '@/features/settings/app-settings/biometric';
import {Host, List, Switch, Section, Text} from '@/modules/sykamore-ui/src/ios';
import {useHaptic} from '@/providers';
import {AppIcons, Icon} from '@/utils';

export default function AppSettingsScreen() {
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
    <Host style={{flex: 1}} matchContents>
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
            label="Face ID"
            icon={
              <Icon
                name={AppIcons.settings.biometric}
                useSwiftUI
                colorToken="accentGreen"
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
            icon={
              <Icon
                name={AppIcons.settings.haptic}
                useSwiftUI
                colorToken="destructive"
              />
            }
          />
        </Section>
      </List>
    </Host>
  );
}
