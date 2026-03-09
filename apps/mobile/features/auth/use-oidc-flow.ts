import {useCallback, useMemo} from 'react';
import {authService, getMobileOidcClientConfig} from '@sykamore/auth';
import {errorCenter} from '@sykamore/client-runtime';
import {
  validateOidcStartAction,
  type OidcStartAction,
} from '@sykamore/types';
import {AuthRequest, ResponseType, makeRedirectUri} from 'expo-auth-session';

const REDIRECT_SCHEME = 'com.sykamore.app';
const REDIRECT_PATH = 'oauth/callback';

type OidcFlowStartOptions = {
  action?: OidcStartAction;
};

type OidcFlowOutcome =
  | {completed: true}
  | {completed: false; cancelled: boolean};

export function useOidcFlow() {
  const oidcConfig = useMemo(() => {
    try {
      return getMobileOidcClientConfig();
    } catch {
      return null;
    }
  }, []);

  const isConfigured = oidcConfig !== null;

  const startFlow = useCallback(
    async (options?: OidcFlowStartOptions): Promise<OidcFlowOutcome> => {
      if (!oidcConfig) {
        errorCenter.report('Sign-in is not configured for this build.', {
          title: 'Sign-In Unavailable',
          scope: 'local',
          isRetryable: false,
        });
        return {completed: false, cancelled: false};
      }

      const actionResult = validateOidcStartAction(options?.action ?? 'login');
      if (!actionResult.success) {
        errorCenter.report('This sign-in action is not available.', {
          title: 'Sign-In Failed',
          scope: 'local',
          isRetryable: false,
        });
        return {completed: false, cancelled: false};
      }
      const action = actionResult.data;

      const redirectUri = makeRedirectUri({
        scheme: REDIRECT_SCHEME,
        path: REDIRECT_PATH,
      });

      try {
        const discoveryDocument = await authService.fetchMobileOidcDiscovery();

        const authRequest = new AuthRequest({
          clientId: oidcConfig.mobileClientId,
          scopes: oidcConfig.scopes,
          redirectUri,
          responseType: ResponseType.Code,
          usePKCE: true,
          extraParams: action === 'login' ? undefined : {action},
        });

        const authResult = await authRequest.promptAsync({
          authorizationEndpoint: discoveryDocument.authorization_endpoint,
        });

        if (authResult.type === 'dismiss' || authResult.type === 'cancel') {
          return {completed: false, cancelled: true};
        }

        if (authResult.type !== 'success') {
          const message =
            authResult.type === 'error'
              ? authResult.params.error_description ||
                authResult.params.error ||
                "We couldn't complete sign-in. Please try again."
              : "We couldn't complete sign-in. Please try again.";

          errorCenter.report(message, {
            title: 'Sign-In Failed',
            scope: 'local',
            isRetryable: false,
          });
          return {completed: false, cancelled: false};
        }

        if (!authResult.params.code || !authRequest.codeVerifier) {
          errorCenter.report(
            "We couldn't complete sign-in securely. Please try again.",
            {
              title: 'Sign-In Failed',
              scope: 'local',
              isRetryable: false,
            },
          );
          return {completed: false, cancelled: false};
        }

        await authService.completeMobileOidcLogin({
          code: authResult.params.code,
          codeVerifier: authRequest.codeVerifier,
          redirectUri,
          tokenEndpoint: discoveryDocument.token_endpoint,
        });
        return {completed: true};
      } catch (error) {
        errorCenter.report(error, {
          title: 'Sign-In Failed',
          scope: 'local',
        });
        return {completed: false, cancelled: false};
      }
    },
    [oidcConfig],
  );

  return {
    startFlow,
    isConfigured,
  };
}
