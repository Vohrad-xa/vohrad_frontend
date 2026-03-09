import {useCallback} from 'react';
import {Platform} from 'react-native';
import {authService, type AppleTokenExchangeUserProfile} from '@sykamore/auth';
import {errorCenter} from '@sykamore/client-runtime';
import * as AppleAuthentication from 'expo-apple-authentication';

type AppleSignInOutcome =
  | {completed: true}
  | {completed: false; cancelled: boolean};

export function useAppleSignIn() {
  const isSupported = Platform.OS === 'ios';

  const startFlow = useCallback(async (): Promise<AppleSignInOutcome> => {
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

      const userProfile: AppleTokenExchangeUserProfile | undefined =
        buildAppleUserProfile(credential);

      await authService.completeMobileAppleLogin({
        idToken: credential.identityToken,
        userProfile,
      });

      return {completed: true};
    } catch (error) {
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

function buildAppleUserProfile(
  credential: AppleAuthentication.AppleAuthenticationCredential,
): AppleTokenExchangeUserProfile | undefined {
  const firstName = credential.fullName?.givenName ?? undefined;
  const lastName = credential.fullName?.familyName ?? undefined;
  const email = credential.email ?? undefined;

  if (!firstName && !lastName && !email) {
    return undefined;
  }

  return {
    email,
    name:
      firstName || lastName
        ? {
            firstName,
            lastName,
          }
        : undefined,
  };
}
