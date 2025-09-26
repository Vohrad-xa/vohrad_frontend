import type {AuthTokens, User, UserLoginRequest, AdminLoginRequest, TokenResponse} from '@vohrad/types';
import {httpClient} from './http-client';
import {getApiConfig} from './config';
import {API_ENDPOINTS} from './endpoints';

export class AuthApi {
  async loginUser(credentials: UserLoginRequest): Promise<{tokens: AuthTokens; user: User}> {
    const response = await httpClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN_USER,
      credentials,
      credentials.tenant_id ?? getApiConfig().tenant,
    );

    const tokens: AuthTokens = response.data;
    // Parse user info from JWT access token
    const user: User = this.parseUserFromJWT(tokens.access_token, credentials.email);

    return {tokens, user};
  }

  async loginAdmin(credentials: AdminLoginRequest): Promise<{tokens: AuthTokens; user: User}> {
    const response = await httpClient.post<TokenResponse>(API_ENDPOINTS.AUTH.LOGIN_ADMIN, credentials);
    const tokens: AuthTokens = response.data;
    // Parse admin user info from JWT access token
    const user: User = this.parseUserFromJWT(tokens.access_token, credentials.email);

    return {tokens, user};
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await httpClient.post<TokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {refresh_token: refreshToken});

    return response.data;
  }

  async logout(): Promise<void> {
    await httpClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT, {}, getApiConfig().tenant);
  }

  async logoutAllDevices(): Promise<void> {
    await httpClient.post<{revoked_tokens: number; user_id: string}>(
      API_ENDPOINTS.AUTH.LOGOUT_ALL,
      {},
      getApiConfig().tenant,
    );
  }

  private parseUserFromJWT(accessToken: string, email: string): User {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));

      return {
        id: payload.sub || 'unknown',
        email: payload.email || email,
        role: payload.user_type === 'admin' ? 'admin' : 'user',
        tenant_id: payload.tenant_id || undefined,
      };
    } catch (error) {
      console.warn('Failed to parse JWT token:', error);
      return {
        id: 'unknown',
        email,
        role: 'user',
      };
    }
  }
}

// Create singleton instance
export const authApi = new AuthApi();
