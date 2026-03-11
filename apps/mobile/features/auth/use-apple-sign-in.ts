import {useCallback} from 'react';
import {Platform} from 'react-native';
import {authService} from '@sykamore/auth';
import {errorCenter} from '@sykamore/client-runtime';
import * as AppleAuthentication from 'expo-apple-authentication';
import {attemptAppleLinkFallback} from './apple-link-fallback';

type AppleSignInOutcome =
  | {completed: true}
  | {completed: false; cancelled: boolean};

export function useAppleSignIn() {
  const isSupported = Platform.OS === 'ios';

  const startFlow = useCallback(async (): Promise<AppleSignInOutcome> => {
    let identityToken: string | null = null;

    if (Platform.OS !== 'ios') {
      return {completed: false, cancelled: false};
    }

    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      errorCenter.report(
        'Sign in with Apple is not available on this device.',
        {
          title: 'Apple Sign-In Unavailable',
          scope: 'local',
          isRetryable: false,
        },
      );
      return {completed: false, cancelled: false};
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        errorCenter.report(
          'Apple did not return the credentials needed to continue.',
          {
            title: 'Sign-In Failed',
            scope: 'local',
            isRetryable: false,
          },
        );
        return {completed: false, cancelled: false};
      }
      identityToken = credential.identityToken;

      await authService.completeMobileAppleLogin({
        idToken: identityToken,
      });

      return {completed: true};
    } catch (error) {
      const fallbackResult = await attemptAppleLinkFallback({
        error,
        retryExchange: async () => {
          if (!identityToken) {
            throw new Error('Apple identity token is missing for retry.');
          }
          await authService.completeMobileAppleLogin({
            idToken: identityToken,
          });
        },
      });

      if (fallbackResult.handled) {
        if (fallbackResult.completed) {
          return {completed: true};
        }
        if (fallbackResult.cancelled) {
          return {completed: false, cancelled: true};
        }
        errorCenter.report(fallbackResult.error ?? error, {
          title: 'Sign-In Failed',
          scope: 'local',
        });
        return {completed: false, cancelled: false};
      }

      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
          ? error.code
          : null;

      if (code === 'ERR_REQUEST_CANCELED') {
        return {completed: false, cancelled: true};
      }

      errorCenter.report(error, {
        title: 'Sign-In Failed',
        scope: 'local',
      });
      return {completed: false, cancelled: false};
    }
  }, []);

  return {
    startFlow,
    isSupported,
  };
}
