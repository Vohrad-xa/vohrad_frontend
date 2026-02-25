import {useCallback} from 'react';
import {Alert} from 'react-native';
import * as biometricService from '@/features/security/biometric-service';

/**
 * Prompts the user to enable biometric unlock after a successful sign-in,
 * but only when the device supports it and the user hasn't been asked before.
 */
export function useBiometricPrompt() {
  const promptEnableIfNeeded = useCallback(async () => {
    const shouldPrompt = await biometricService.shouldPromptEnable();
    if (!shouldPrompt) return;

    const onEnable = async () => {
      const result = await biometricService.enableWithAuthentication();
      if (result.success || result.cancelled) return;

      const message =
        result.error === 'LOCKED'
          ? 'Face ID is temporarily locked. Unlock your device with the passcode, then try again.'
          : result.error === 'NOT_ENROLLED'
            ? 'Face ID or Touch ID is not set up on this device. Enable it in Settings to proceed.'
            : 'Face ID could not be enabled. Check your device settings and try again.';

      Alert.alert('Unable to Enable Face ID', message);
    };

    Alert.alert(
      'Use Face ID?',
      'Secure your account with Face ID or Touch ID for instant sign-in.',
      [
        {
          text: 'Not now',
          style: 'cancel',
          onPress: () => biometricService.recordDecline().catch(() => {}),
        },
        {text: 'Enable', onPress: () => void onEnable()},
      ],
    );
  }, []);

  return {promptEnableIfNeeded};
}
