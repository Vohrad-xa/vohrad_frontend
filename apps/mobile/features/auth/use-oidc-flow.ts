import {useCallback, useMemo} from 'react';
import {authService, getMobileOidcClientConfig} from '@sykamore/auth';
import {errorCenter} from '@sykamore/client-runtime';
import {validateOidcStartAction, type OidcStartAction} from '@sykamore/types';
import {AuthRequest, ResponseType} from 'expo-auth-session';

type OidcIdpHint = 'google';

type OidcFlowStartOptions = {
  action?: OidcStartAction;
  idpHint?: OidcIdpHint;
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
      const idpHint = options?.idpHint;

      const redirectUri = oidcConfig.mobileRedirectUri;

      try {
        const discoveryDocument = await authService.fetchMobileOidcDiscovery();

        const authRequest = new AuthRequest({
          clientId: oidcConfig.mobileClientId,
          scopes: oidcConfig.scopes,
          redirectUri,
          responseType: ResponseType.Code,
          usePKCE: true,
          extraParams: buildOidcExtraParams(action, idpHint),
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

function buildOidcExtraParams(
  action: OidcStartAction,
  idpHint: OidcIdpHint | undefined,
): Record<string, string> | undefined {
  const params: Record<string, string> = {};
  if (action !== 'login') {
    params.action = action;
  }
  if (idpHint) {
    params.kc_idp_hint = idpHint;
  }
  return Object.keys(params).length > 0 ? params : undefined;
}
