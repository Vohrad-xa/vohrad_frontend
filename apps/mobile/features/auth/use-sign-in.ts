import {useState} from 'react';
import {Alert, Platform} from 'react-native';
import {useAuth} from '@/providers';
import {useBiometricPrompt} from './use-biometric-prompt';
import {useOidcFlow} from './use-oidc-flow';
import {usePasskeyPrompt} from './use-passkey-prompt';

/**
 * Orchestrates the full sign-in flow: passkey setup choice → OIDC login →
 * biometric enrollment prompt. Call `handleSubmit` on a user gesture.
 */
export function useSignIn() {
  const [isStartingMobileFlow, setIsStartingMobileFlow] = useState(false);
  const {startWebLogin, isLoading} = useAuth();
  const {startFlow, isConfigured: isOidcConfigured} = useOidcFlow();
  const {resolvePasskeySetupChoice} = usePasskeyPrompt();
  const {promptEnableIfNeeded} = useBiometricPrompt();

  const handleSubmit = async () => {
    if (isLoading || isStartingMobileFlow) return;

    try {
      if (Platform.OS === 'web') {
        const returnTo =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/';
        const setupPasskey = await resolvePasskeySetupChoice();
        await startWebLogin(returnTo, {setupPasskey});
        return;
      }

      setIsStartingMobileFlow(true);

      const setupPasskey = await resolvePasskeySetupChoice();
      const outcome = await startFlow({setupPasskey});
      if (!outcome.completed) return;

      await promptEnableIfNeeded();
    } catch {
      Alert.alert(
        'Sign in failed',
        'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsStartingMobileFlow(false);
    }
  };

  return {handleSubmit, isLoading, isStartingMobileFlow, isOidcConfigured};
}
