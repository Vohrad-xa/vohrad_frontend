import {useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {authService, getMobileOidcClientConfig} from '@sykamore/auth';
import {AuthRequest, ResponseType, makeRedirectUri} from 'expo-auth-session';

const REDIRECT_SCHEME = 'com.sykamore.app';
const REDIRECT_PATH = 'oauth/callback';

type OidcDiscovery = {
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  revocationEndpoint?: string;
  userInfoEndpoint?: string;
  endSessionEndpoint?: string;
};

type OidcFlowOutcome =
  | {completed: true}
  | {completed: false; cancelled: boolean};

/**
 * Encapsulates the full OIDC browser flow: discovery → AuthRequest →
 * promptAsync → code exchange. Call `startFlow(subdomain)` on a user gesture.
 *
 * - Returns `{ completed: true }` on success.
 * - Returns `{ completed: false, cancelled: true }` when the user dismissed the browser.
 * - Returns `{ completed: false, cancelled: false }` on any error (Alert already shown).
 */
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
    async (subdomain: string): Promise<OidcFlowOutcome> => {
      if (!oidcConfig) {
        Alert.alert(
          'Missing OIDC Configuration',
          'Set EXPO_PUBLIC_OIDC_ISSUER_URL and EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID.',
        );
        return {completed: false, cancelled: false};
      }

      try {
        const discoveryResponse = await fetch(
          `${oidcConfig.issuerUrl}/.well-known/openid-configuration`,
        );
        if (!discoveryResponse.ok) {
          throw new Error('Unable to load OIDC discovery document.');
        }

        const raw = (await discoveryResponse.json()) as {
          authorization_endpoint?: string;
          token_endpoint?: string;
          revocation_endpoint?: string;
          userinfo_endpoint?: string;
          end_session_endpoint?: string;
        };

        const discovery: OidcDiscovery = {
          authorizationEndpoint: raw.authorization_endpoint,
          tokenEndpoint: raw.token_endpoint,
          revocationEndpoint: raw.revocation_endpoint,
          userInfoEndpoint: raw.userinfo_endpoint,
          endSessionEndpoint: raw.end_session_endpoint,
        };

        const redirectUri =
          oidcConfig.mobileRedirectUri ??
          makeRedirectUri({scheme: REDIRECT_SCHEME, path: REDIRECT_PATH});

        const request = new AuthRequest({
          clientId: oidcConfig.mobileClientId,
          responseType: ResponseType.Code,
          scopes: oidcConfig.scopes,
          usePKCE: true,
          redirectUri,
        });

        const result = await request.promptAsync(discovery);

        if (result.type === 'cancel' || result.type === 'dismiss') {
          return {completed: false, cancelled: true};
        }

        if (result.type !== 'success') {
          const message =
            result.type === 'error' && result.error
              ? result.error.message
              : 'Authentication failed.';
          Alert.alert('Sign in failed', message);
          return {completed: false, cancelled: false};
        }

        const {code} = result.params;
        const codeVerifier = request.codeVerifier;

        if (!code || !codeVerifier) {
          Alert.alert(
            'Sign in failed',
            'Missing authorization code or PKCE verifier.',
          );
          return {completed: false, cancelled: false};
        }

        await authService.completeMobileOidcLogin({
          subdomain,
          code,
          codeVerifier,
          redirectUri,
          tokenEndpoint: discovery.tokenEndpoint,
        });

        return {completed: true};
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Authentication failed.';
        Alert.alert('Sign in failed', message);
        return {completed: false, cancelled: false};
      }
    },
    [oidcConfig],
  );

  return {startFlow, isConfigured};
}
