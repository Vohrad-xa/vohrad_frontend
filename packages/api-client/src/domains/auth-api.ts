import type {AuthTokens, User, TokenResponse} from '@sykamore/types';
import {resolveApiUrl} from '../config';
import {httpClient} from '../http-client';
import {API_ENDPOINTS} from './endpoints';

export class AuthApi {
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

  async getCurrentUser(): Promise<User> {
    const userResponse = await httpClient.get<User>(API_ENDPOINTS.USERS.ME);
    return userResponse.data;
  }

  async logoutWebSession(csrfToken: string): Promise<void> {
    await httpClient.post<null>(
      API_ENDPOINTS.AUTH.WEB_LOGOUT,
      {},
      {'X-CSRF-Token': csrfToken},
    );
  }

  async logout(): Promise<void> {
    await httpClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  async logoutAllDevices(): Promise<void> {
    await httpClient.post<{revoked_tokens: number; user_id: string}>(
      API_ENDPOINTS.AUTH.LOGOUT_ALL,
      {},
    );
  }
}

export const authApi = new AuthApi();
