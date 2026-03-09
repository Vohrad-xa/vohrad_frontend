import {useState} from 'react';
import {Platform} from 'react-native';
import {errorCenter} from '@sykamore/client-runtime';
import {useAuth} from '@/providers';
import {useAppleSignIn} from './use-apple-sign-in';
import {useBiometricPrompt} from './use-biometric-prompt';
import {useGoogleSignIn} from './use-google-sign-in';
import {useOidcFlow} from './use-oidc-flow';
import {usePasskeyPrompt} from './use-passkey-prompt';

export function useSignIn() {
  const [isStartingMobileFlow, setIsStartingMobileFlow] = useState(false);
  const [isStartingAppleFlow, setIsStartingAppleFlow] = useState(false);
  const [isStartingGoogleFlow, setIsStartingGoogleFlow] = useState(false);
  const {startWebLogin, isLoading} = useAuth();
  const {startFlow, isConfigured: isOidcConfigured} = useOidcFlow();
  const {startFlow: startAppleFlow, isSupported: isAppleSupported} =
    useAppleSignIn();
  const {startFlow: startGoogleFlow, isSupported: isGoogleSupported} =
    useGoogleSignIn();
  const {resolvePasskeySetupChoice} = usePasskeyPrompt();
  const {promptEnableIfNeeded} = useBiometricPrompt();

  const handleSubmit = async () => {
    if (
      isLoading ||
      isStartingMobileFlow ||
      isStartingAppleFlow ||
      isStartingGoogleFlow
    ) {
      return;
    }

    try {
      if (Platform.OS === 'web') {
        const returnTo =
          typeof window !== 'undefined'
            ? `${window.location.pathname}${window.location.search}`
            : '/';
        const setupPasskey = await resolvePasskeySetupChoice();
        await startWebLogin(returnTo, {
          action: setupPasskey ? 'passkey_register' : 'login',
        });
        return;
      }

      setIsStartingMobileFlow(true);

      const setupPasskey = await resolvePasskeySetupChoice();
      const outcome = await startFlow({
        action: setupPasskey ? 'passkey_register' : 'login',
      });
      if (!outcome.completed) return;

      await promptEnableIfNeeded();
    } catch (error) {
      errorCenter.report(error, {
        title: 'Sign-In Failed',
        scope: 'local',
      });
    } finally {
      setIsStartingMobileFlow(false);
    }
  };

  const handleAppleSubmit = async () => {
    if (
      isLoading ||
      isStartingMobileFlow ||
      isStartingAppleFlow ||
      isStartingGoogleFlow
    ) {
      return;
    }

    setIsStartingAppleFlow(true);
    try {
      const outcome = await startAppleFlow();
      if (!outcome.completed) return;
      await promptEnableIfNeeded();
    } catch (error) {
      errorCenter.report(error, {
        title: 'Sign-In Failed',
        scope: 'local',
      });
    } finally {
      setIsStartingAppleFlow(false);
    }
  };

  const handleGoogleSubmit = async () => {
    if (
      isLoading ||
      isStartingMobileFlow ||
      isStartingAppleFlow ||
      isStartingGoogleFlow
    ) {
      return;
    }

    setIsStartingGoogleFlow(true);
    try {
      const outcome = await startGoogleFlow();
      if (!outcome.completed) return;
      await promptEnableIfNeeded();
    } catch (error) {
      errorCenter.report(error, {
        title: 'Sign-In Failed',
        scope: 'local',
      });
    } finally {
      setIsStartingGoogleFlow(false);
    }
  };

  return {
    handleSubmit,
    handleAppleSubmit,
    handleGoogleSubmit,
    isLoading,
    isStartingMobileFlow,
    isStartingAppleFlow,
    isStartingGoogleFlow,
    isOidcConfigured,
    isAppleSupported,
    isGoogleSupported,
  };
}
