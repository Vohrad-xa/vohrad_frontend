import type {AuthTokens, User, UserLoginRequest, AdminLoginRequest, TokenResponse} from '@vohrad/types';
import {httpClient} from './http-client';
import {getApiConfig} from './config';
import {API_ENDPOINTS} from './endpoints';

export class AuthApi {
  async loginUser(credentials: UserLoginRequest): Promise<{tokens: AuthTokens; user: User}> {
    return this.login(API_ENDPOINTS.AUTH.LOGIN_USER, credentials);
  }

  async loginAdmin(credentials: AdminLoginRequest): Promise<{tokens: AuthTokens; user: User}> {
    return this.login(API_ENDPOINTS.AUTH.LOGIN_ADMIN, credentials);
  }

  private async login(
    endpoint: string,
    credentials: UserLoginRequest | AdminLoginRequest,
  ): Promise<{tokens: AuthTokens; user: User}> {
    const response = await httpClient.post<TokenResponse>(endpoint, credentials);

    const tokens: AuthTokens = {
      ...response.data,
      issued_at: Date.now(),
    };

    // Set access token for subsequent requests
    httpClient.setAccessToken(tokens.access_token);

    // Get user profile from /users/me endpoint
    const userResponse = await httpClient.get<User>(API_ENDPOINTS.USERS.ME);
    const user: User = userResponse.data;

    return {tokens, user};
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await httpClient.post<TokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {refresh_token: refreshToken});

    return {
      ...response.data,
      issued_at: Date.now(),
    };
  }

  async logout(): Promise<void> {
    await httpClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT, {});
  }

  async logoutAllDevices(): Promise<void> {
    await httpClient.post<{revoked_tokens: number; user_id: string}>(API_ENDPOINTS.AUTH.LOGOUT_ALL, {});
  }
}

// Create singleton instance
export const authApi = new AuthApi();
