import {
  emptyDataSchema,
  identitySchema,
  logoutAllDevicesResultSchema,
  tenantMembershipSchema,
  tokenResponseSchema,
  validateStartWebLoginOptions,
  type AuthTokens,
  type Identity,
  type LogoutAllDevicesResult,
  type StartWebLoginOptions,
  type TenantMembership,
} from '@sykamore/types';
import {resolveApiUrl} from '../core/url-resolver';
import {httpClient} from '../core/client';
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

const tenantMembershipsSchema = tenantMembershipSchema.array();

export class AuthApi {
  getOidcStartUrl(returnTo?: string, options?: StartWebLoginOptions): string {
    const optionsResult = validateStartWebLoginOptions(options ?? {});
    if (!optionsResult.success) {
      throw new Error('Invalid OIDC start options');
    }

    const url = new URL(resolveApiUrl(API_ENDPOINTS.AUTH.OIDC_START));
    if (returnTo && returnTo.trim().length > 0) {
      url.searchParams.set('return_to', returnTo.trim());
    }
    const action = optionsResult.data.action;
    if (action && action !== 'login') {
      url.searchParams.set('action', action);
    }
    return url.toString();
  }

  async issueWebAccessToken(csrfToken: string): Promise<AuthTokens> {
    const response = await httpClient.post(
      API_ENDPOINTS.AUTH.WEB_TOKEN,
      tokenResponseSchema,
      {},
      {'X-CSRF-Token': csrfToken},
      {reportErrors: false},
    );

    return {
      ...response.data,
      issued_at: Date.now(),
    };
  }

  async getMeProfile(): Promise<Identity> {
    const response = await httpClient.get(
      API_ENDPOINTS.ME.PROFILE,
      identitySchema,
      {
        reportErrors: false,
      },
    );
    return response.data;
  }

  async getMyTenants(): Promise<TenantMembership[]> {
    const response = await httpClient.get(
      API_ENDPOINTS.ME.TENANTS,
      tenantMembershipsSchema,
      {reportErrors: false},
    );
    return response.data;
  }

  async logoutWebSession(csrfToken: string): Promise<void> {
    await httpClient.post(
      API_ENDPOINTS.AUTH.WEB_LOGOUT,
      emptyDataSchema,
      {},
      {'X-CSRF-Token': csrfToken},
      {reportErrors: false},
    );
  }

  async logout(): Promise<void> {
    await httpClient.post(
      API_ENDPOINTS.AUTH.LOGOUT,
      emptyDataSchema,
      {},
      undefined,
      {reportErrors: false},
    );
  }

  async logoutAllDevices(): Promise<LogoutAllDevicesResult> {
    const response = await httpClient.post(
      API_ENDPOINTS.AUTH.LOGOUT_ALL,
      logoutAllDevicesResultSchema,
      {},
      undefined,
      {reportErrors: false},
    );
    return response.data;
  }

  async exchangeSocialToken(payload: {
    provider: SocialProvider;
    token: string;
    userProfile?: SocialTokenExchangeUserProfile;
  }): Promise<AuthTokens> {
    const response = await httpClient.post(
      API_ENDPOINTS.AUTH.SOCIAL_EXCHANGE,
      tokenResponseSchema,
      {
        provider: payload.provider,
        token: payload.token,
        user_profile: payload.userProfile,
      },
      undefined,
      {reportErrors: false},
    );

    return {
      ...response.data,
      issued_at: Date.now(),
    };
  }

  async refreshSocialToken(payload: {
    refreshToken: string;
  }): Promise<AuthTokens> {
    const response = await httpClient.post(
      API_ENDPOINTS.AUTH.SOCIAL_REFRESH,
      tokenResponseSchema,
      {
        refresh_token: payload.refreshToken,
      },
      undefined,
      {reportErrors: false},
    );

    return {
      ...response.data,
      issued_at: Date.now(),
    };
  }
}

export const authApi = new AuthApi();
