import {useCallback} from 'react';
import {Alert, Platform} from 'react-native';
import {authService, type AppleTokenExchangeUserProfile} from '@sykamore/auth';
import * as AppleAuthentication from 'expo-apple-authentication';

type AppleSignInOutcome =
  | {completed: true}
  | {completed: false; cancelled: boolean};

/**
 * Runs native Sign in with Apple then exchanges Apple identityToken via backend.
 */
export function useAppleSignIn() {
  const isSupported = Platform.OS === 'ios';

  const startFlow = useCallback(async (): Promise<AppleSignInOutcome> => {
    if (Platform.OS !== 'ios') {
      return {completed: false, cancelled: false};
    }

    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        'Apple Sign In unavailable',
        'This device does not support Sign in with Apple.',
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
        Alert.alert(
          'Sign in failed',
          'Apple did not return an identity token.',
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
          : undefined;

      if (code === 'ERR_REQUEST_CANCELED') {
        return {completed: false, cancelled: true};
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.';
      Alert.alert('Sign in failed', message);
      return {completed: false, cancelled: false};
    }
  }, []);

  return {startFlow, isSupported};
}

function buildAppleUserProfile(
  credential: AppleAuthentication.AppleAuthenticationCredential,
): AppleTokenExchangeUserProfile | undefined {
  const firstName = credential.fullName?.givenName?.trim();
  const lastName = credential.fullName?.familyName?.trim();
  const email = credential.email?.trim();

  const profile: AppleTokenExchangeUserProfile = {};
  if (firstName ?? lastName) {
    profile.name = {
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
    };
  }
  if (email) {
    profile.email = email;
  }

  return Object.keys(profile).length > 0 ? profile : undefined;
}
