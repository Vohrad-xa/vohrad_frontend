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

/** Optional social profile data forwarded to backend token exchange. */
type SocialTokenExchangeUserProfile = {
  name?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
};

type SocialProvider = 'apple' | 'google';

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
   * Exchange social provider token via backend and return normalized auth tokens.
   */
  async exchangeSocialToken(payload: {
    provider: SocialProvider;
    token: string;
    userProfile?: SocialTokenExchangeUserProfile;
  }): Promise<AuthTokens> {
    const tokenPayload = await this.requestSocialTokenGrant(
      API_ENDPOINTS.AUTH.SOCIAL_EXCHANGE,
      {
        provider: payload.provider,
        token: payload.token,
        user_profile: payload.userProfile,
      },
    );

    return {
      ...tokenPayload,
      issued_at: Date.now(),
    };
  }

  /**
   * Refresh social-exchange mobile tokens via backend confidential client.
   */
  async refreshSocialToken(payload: {
    refreshToken: string;
  }): Promise<AuthTokens> {
    const tokenPayload = await this.requestSocialTokenGrant(
      API_ENDPOINTS.AUTH.SOCIAL_REFRESH,
      {
        refresh_token: payload.refreshToken,
      },
    );

    return {
      ...tokenPayload,
      issued_at: Date.now(),
    };
  }

  private async requestSocialTokenGrant(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<TokenResponse> {
    const rawResponse = await httpClient.makeRequest<unknown>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return this.parseSocialExchangeResponse(rawResponse);
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
  private parseSocialExchangeResponse(rawResponse: unknown): TokenResponse {
    const tokenPayload = this.isApiEnvelope<TokenResponse>(rawResponse)
      ? rawResponse.data
      : rawResponse;

    if (!tokenPayload || typeof tokenPayload !== 'object') {
      throw new Error('Invalid social token exchange response');
    }

    const tokenRecord = tokenPayload as Record<string, unknown>;
    if (
      typeof tokenRecord.access_token !== 'string' ||
      typeof tokenRecord.token_type !== 'string'
    ) {
      throw new Error('Invalid social token exchange response');
    }

    return tokenPayload as TokenResponse;
  }
}

export const authApi = new AuthApi();
