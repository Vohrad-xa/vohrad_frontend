import {useCallback} from 'react';
import {useBiometricToggle} from '@/features/settings/app-settings/biometric';
import {useHaptic} from '@/providers';
import {AppIcons} from '@/utils';
import {Host, List, Toggle, Section} from 'sykamore-ui/ios';

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
        <Section>
          <Toggle
            label="Face ID"
            onIsOnChange={handleBiometricChange}
            isOn={biometricEnabled}
            systemImage={AppIcons.ui.biometric}
          />

          <Toggle
            label="Haptic Feedback"
            onIsOnChange={handleHapticChange}
            isOn={hapticEnabled}
            systemImage={AppIcons.ui.haptic}
          />
        </Section>
      </List>
    </Host>
  );
}
