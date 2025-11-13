import type {
  AuthTokens,
  User,
  UserCredentials,
  AdminCredentials,
  TokenResponse,
} from '@vohrad/types';
import {httpClient} from './http-client';
import {API_ENDPOINTS} from './endpoints';

export class AuthApi {
  async loginUser(
    credentials: UserCredentials,
  ): Promise<{tokens: AuthTokens; user: User}> {
    return this.login(API_ENDPOINTS.AUTH.LOGIN_USER, credentials);
  }

  async loginAdmin(
    credentials: AdminCredentials,
  ): Promise<{tokens: AuthTokens; user: User}> {
    return this.login(API_ENDPOINTS.AUTH.LOGIN_ADMIN, credentials);
  }

  private async login(
    endpoint: string,
    credentials: UserCredentials | AdminCredentials,
  ): Promise<{tokens: AuthTokens; user: User}> {
    const response = await httpClient.post<TokenResponse>(
      endpoint,
      credentials,
    );

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

  async refreshToken(refreshToken?: string): Promise<AuthTokens> {
    // On web we rely on cookies, so the payload is only sent for native clients.
    const payload = refreshToken ? {refresh_token: refreshToken} : undefined;
    const response = await httpClient.post<TokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      payload,
    );

    return {
      ...response.data,
      issued_at: Date.now(),
    };
  }

  async getCurrentUser(): Promise<User> {
    // Browser bootstrap uses this after refreshing via cookie.
    const userResponse = await httpClient.get<User>(API_ENDPOINTS.USERS.ME);
    return userResponse.data;
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
