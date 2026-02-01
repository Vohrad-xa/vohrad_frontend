import {useCallback} from 'react';
import {useBiometricToggle} from '@/features/settings/app-settings/biometric';
import {useHaptic} from '@/providers';
import {AppIcons, Icon} from '@/utils';
import {Host, List, Toggle, Section, Text} from 'sykamore-ui/ios';

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
    <Host style={{flex: 1}}>
      <List listStyle="automatic">
        <Section
          footer={
            <Text>
              Enable Face ID or Touch ID to quickly and securely access the app.
            </Text>
          }
        >
          <Toggle
            isOn={biometricEnabled}
            onIsOnChange={handleBiometricChange}
            label="Face ID"
          >
            <Icon
              name={AppIcons.ui.biometric}
              useSwiftUI
              colorToken="accentGreen"
            />
          </Toggle>
        </Section>

        <Section
          footer={
            <Text>
              Enable haptic feedback to receive tactile responses when
              interacting with the app.
            </Text>
          }
        >
          <Toggle
            isOn={hapticEnabled}
            onIsOnChange={handleHapticChange}
            label="Haptic Feedback"
          >
            <Icon name={AppIcons.ui.haptic} useSwiftUI colorToken="accentRed" />
          </Toggle>
        </Section>
      </List>
    </Host>
  );
}
