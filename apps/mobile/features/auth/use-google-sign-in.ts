import {useCallback} from 'react';
import {Platform} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {authService} from '@sykamore/auth';
import {errorCenter} from '@sykamore/client-runtime';
import {env} from '@/utils/env';

type GoogleSignInOutcome =
  | {completed: true}
  | {completed: false; cancelled: boolean};

let googleSigninConfigured = false;

function isGoogleConfiguredForPlatform(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }
  if (!env.google.webClientId) {
    return false;
  }
  if (Platform.OS === 'ios' && !env.google.iosClientId) {
    return false;
  }
  if (Platform.OS === 'android' && !env.google.androidClientId) {
    return false;
  }
  return true;
}

function configureGoogleSigninIfNeeded(): boolean {
  if (!isGoogleConfiguredForPlatform()) {
    return false;
  }
  if (googleSigninConfigured) {
    return true;
  }

  GoogleSignin.configure({
    webClientId: env.google.webClientId,
    iosClientId: env.google.iosClientId,
  });
  googleSigninConfigured = true;
  return true;
}

export function useGoogleSignIn() {
  const isSupported = isGoogleConfiguredForPlatform();

  const startFlow = useCallback(async (): Promise<GoogleSignInOutcome> => {
    if (!configureGoogleSigninIfNeeded()) {
      errorCenter.report('Google Sign-In is not configured for this build.', {
        title: 'Google Sign-In Unavailable',
        scope: 'local',
        isRetryable: false,
      });
      return {completed: false, cancelled: false};
    }

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const result = await GoogleSignin.signIn();
      if (result.type === 'cancelled') {
        return {completed: false, cancelled: true};
      }

      const {accessToken} = await GoogleSignin.getTokens();
      await authService.completeMobileGoogleLogin({accessToken});
      return {completed: true};
    } catch (error) {
      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
          ? error.code
          : undefined;

      if (code === statusCodes.SIGN_IN_CANCELLED) {
        return {completed: false, cancelled: true};
      }
      if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorCenter.report(
          'Google Play Services are unavailable on this device.',
          {
            title: 'Google Sign-In Unavailable',
            scope: 'local',
            isRetryable: false,
          },
        );
        return {completed: false, cancelled: false};
      }
      if (code === statusCodes.IN_PROGRESS) {
        return {completed: false, cancelled: false};
      }

      errorCenter.report(error, {
        title: 'Sign-In Failed',
        scope: 'local',
      });
      return {completed: false, cancelled: false};
    }
  }, []);

  return {startFlow, isSupported};
}
