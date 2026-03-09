import {
  normalizeTransportError,
  parseProblemResponse,
} from '@sykamore/api-client';
import {
  parseJson,
  parseJsonWithSchema,
  validateAuthTokens,
  validateMobileOidcLoginParams,
  oauthTokenErrorSchema,
  oidcDiscoveryDocumentSchema,
  type AuthTokens,
  type MobileOidcLoginParams,
  type OidcDiscoveryDocument,
} from '@sykamore/types';
import {getMobileOidcClientConfig} from '../config/mobile-oidc-config';
import {
  createInvalidAuthResponseError,
  createSessionExpiredError,
  createSignInStateError,
  createSignInUnavailableError,
} from '../core/auth-client-errors';

export class MobileOidcClient {
  private tokenEndpoint: string | null = null;

  async fetchDiscoveryDocument(): Promise<OidcDiscoveryDocument> {
    const config = getMobileOidcClientConfig();
    const {response, rawBody} = await this.fetchRaw(
      `${config.issuerUrl.replace(/\/$/, '')}/.well-known/openid-configuration`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      const oauthErrorResult = parseJsonWithSchema(rawBody, oauthTokenErrorSchema);
      if (oauthErrorResult.success && oauthErrorResult.data.error === 'invalid_grant') {
        throw createSessionExpiredError(
          oauthErrorResult.data.error_description ||
            'Your session has expired. Please sign in again.',
          'OIDC_INVALID_GRANT',
        );
      }

      throw parseProblemResponse(response, rawBody);
    }

    const discoveryResult = parseJsonWithSchema(
      rawBody,
      oidcDiscoveryDocumentSchema,
    );
    if (!discoveryResult.success) {
      throw createSignInUnavailableError(
        'The sign-in service returned an invalid configuration.',
        'INVALID_OIDC_DISCOVERY',
      );
    }

    this.tokenEndpoint = discoveryResult.data.token_endpoint;
    return discoveryResult.data;
  }

  async exchangeCodeForTokens(
    params: MobileOidcLoginParams,
  ): Promise<AuthTokens> {
    const paramsResult = validateMobileOidcLoginParams(params);
    if (!paramsResult.success) {
      throw createSignInStateError();
    }

    const validatedParams = paramsResult.data;
    if (validatedParams.tokenEndpoint) {
      this.tokenEndpoint = validatedParams.tokenEndpoint;
    }

    const config = getMobileOidcClientConfig();
    const tokenEndpoint = await this.resolveTokenEndpoint();
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.mobileClientId,
      code: validatedParams.code,
      redirect_uri: validatedParams.redirectUri,
      code_verifier: validatedParams.codeVerifier,
    });

    return this.requestTokens(tokenEndpoint, body, {
      code: 'OIDC_TOKEN_EXCHANGE_FAILED',
      title: 'Sign-In Failed',
      fallbackDetail: "We couldn't complete sign-in. Please try again.",
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken.trim()) {
      throw createSessionExpiredError();
    }

    const config = getMobileOidcClientConfig();
    const tokenEndpoint = await this.resolveTokenEndpoint();
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.mobileClientId,
      refresh_token: refreshToken,
    });

    return this.requestTokens(tokenEndpoint, body, {
      code: 'OIDC_REFRESH_FAILED',
      title: 'Session Expired',
      fallbackDetail:
        'Your session could not be refreshed. Please sign in again.',
    });
  }

  private async resolveTokenEndpoint(): Promise<string> {
    if (this.tokenEndpoint) {
      return this.tokenEndpoint;
    }

    const discovery = await this.fetchDiscoveryDocument();
    this.tokenEndpoint = discovery.token_endpoint;
    return this.tokenEndpoint;
  }

  private async requestTokens(
    tokenEndpoint: string,
    body: URLSearchParams,
    errorMeta: {
      code: string;
      title: string;
      fallbackDetail: string;
    },
  ): Promise<AuthTokens> {
    const {response, rawBody} = await this.fetchRaw(tokenEndpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });

    if (!response.ok) {
      throw parseProblemResponse(response, rawBody);
    }

    const parsedJson = parseJson(rawBody);
    if (!parsedJson.success) {
      throw createInvalidAuthResponseError(
        errorMeta.title === 'Session Expired'
          ? 'The session refresh response was invalid. Please sign in again.'
          : 'The sign-in service returned an invalid response.',
        'INVALID_OIDC_TOKEN_RESPONSE',
        errorMeta.title,
      );
    }

    const tokensResult = validateAuthTokens(parsedJson.data);
    if (!tokensResult.success) {
      throw createInvalidAuthResponseError(
        errorMeta.title === 'Session Expired'
          ? 'The session refresh response was invalid. Please sign in again.'
          : 'The sign-in service returned an invalid response.',
        'INVALID_OIDC_TOKEN_RESPONSE',
        errorMeta.title,
      );
    }

    return {
      ...tokensResult.data,
      issued_at: Date.now(),
    };
  }

  private async fetchRaw(
    url: string,
    init: RequestInit,
  ): Promise<{response: Response; rawBody: string}> {
    try {
      const response = await fetch(url, init);
      const rawBody = (await response.text()).trim();
      return {response, rawBody};
    } catch (error) {
      throw normalizeTransportError(error);
    }
  }
}
