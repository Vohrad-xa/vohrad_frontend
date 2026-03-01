import type {
  ApiResponse,
  AuthTokens,
  Identity,
  TokenResponse,
  TenantMembership,
} from '@sykamore/types';
import {resolveApiUrl} from '../config';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

/**
 * Optional Apple profile data forwarded to backend token exchange.
 * Apple may provide email/name only on first sign-in.
 */
type AppleTokenExchangeUserProfile = {
  name?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
};

export class AuthApi {
  /**
   * Build OIDC start URL with optional return path and passkey flag.
   */
  getOidcStartUrl(
    returnTo?: string,
    options?: {
      setupPasskey?: boolean;
    },
  ): string {
    const url = new URL(resolveApiUrl(API_ENDPOINTS.AUTH.OIDC_START));
    if (returnTo && returnTo.trim().length > 0) {
      url.searchParams.set('return_to', returnTo.trim());
    }
    if (options?.setupPasskey) {
      url.searchParams.set('setup_passkey', 'true');
    }
    return url.toString();
  }

  /**
   * Exchange web session cookie for short-lived access tokens.
   */
  async issueWebAccessToken(csrfToken: string): Promise<AuthTokens> {
    const response = await httpClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.WEB_TOKEN,
      {},
      {'X-CSRF-Token': csrfToken},
    );

    return {
      ...response.data,
      issued_at: Date.now(),
    };
  }

  /**
   * Fetch current identity profile.
   */
  async getMeProfile(): Promise<Identity> {
    const response = await httpClient.get<Identity>(API_ENDPOINTS.ME.PROFILE);
    return response.data;
  }

  /**
   * Fetch tenant memberships for current user.
   */
  async getMyTenants(): Promise<TenantMembership[]> {
    const response = await httpClient.get<TenantMembership[]>(
      API_ENDPOINTS.ME.TENANTS,
    );
    return response.data;
  }

  /**
   * Logout current web session (cookie + CSRF flow).
   */
  async logoutWebSession(csrfToken: string): Promise<void> {
    await httpClient.post<null>(
      API_ENDPOINTS.AUTH.WEB_LOGOUT,
      {},
      {'X-CSRF-Token': csrfToken},
    );
  }

  /**
   * Logout current bearer session.
   */
  async logout(): Promise<void> {
    await httpClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  /**
   * Logout all active sessions for current identity.
   */
  async logoutAllDevices(): Promise<void> {
    await httpClient.post<{revoked_tokens: number; user_id: string}>(
      API_ENDPOINTS.AUTH.LOGOUT_ALL,
      {},
    );
  }

  /**
   * Exchange Apple id_token via backend and return normalized auth tokens.
   */
  async exchangeAppleToken(payload: {
    idToken: string;
    userProfile?: AppleTokenExchangeUserProfile;
  }): Promise<AuthTokens> {
    const rawResponse = (await httpClient.makeRequest<unknown>(
      API_ENDPOINTS.AUTH.APPLE_EXCHANGE,
      {
        method: 'POST',
        body: JSON.stringify({
          id_token: payload.idToken,
          user_profile: payload.userProfile,
        }),
      },
    )) as unknown;

    const tokenPayload = this.parseAppleExchangeResponse(rawResponse);

    return {
      ...tokenPayload,
      issued_at: Date.now(),
    };
  }

  /**
   * Accept raw or envelope token payload and enforce minimal token shape.
   */
  private isApiEnvelope<T>(value: unknown): value is ApiResponse<T> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      'data' in value
    );
  }
  private parseAppleExchangeResponse(rawResponse: unknown): TokenResponse {
    const tokenPayload = this.isApiEnvelope<TokenResponse>(rawResponse)
      ? rawResponse.data
      : rawResponse;

    if (!tokenPayload || typeof tokenPayload !== 'object') {
      throw new Error('Invalid Apple token exchange response');
    }

    const tokenRecord = tokenPayload as Record<string, unknown>;
    if (
      typeof tokenRecord.access_token !== 'string' ||
      typeof tokenRecord.token_type !== 'string'
    ) {
      throw new Error('Invalid Apple token exchange response');
    }

    return tokenPayload as TokenResponse;
  }
}

export const authApi = new AuthApi();
