import {useAuthStore} from '@vohrad/store';
import type {UserLoginRequest, AdminLoginRequest} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {authApi} from '@vohrad/api-client';
import {httpClient} from '@vohrad/api-client';

export class AuthService {
  private static instance: AuthService;

  private constructor() {
    this.syncTokenFromStore();
    useAuthStore.subscribe((state) => {
      if (state.tokens?.access_token) {
        httpClient.setAccessToken(state.tokens.access_token);
      } else {
        httpClient.setAccessToken(null);
      }
    });
  }

  private syncTokenFromStore() {
    const {tokens} = useAuthStore.getState();
    if (tokens?.access_token) {
      httpClient.setAccessToken(tokens.access_token);
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async loginUser(email: string, password: string): Promise<void> {
    const {setLoading, setError, login} = useAuthStore.getState();

    try {
      setLoading(true);
      setError(null);

      const credentials: UserLoginRequest = {email, password};
      const {tokens, user} = await authApi.loginUser(credentials);

      httpClient.setAccessToken(tokens.access_token);
      login(user, tokens);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    const {setLoading, setError, login} = useAuthStore.getState();

    try {
      setLoading(true);
      setError(null);

      const credentials: AdminLoginRequest = {email, password};
      const {tokens, user} = await authApi.loginAdmin(credentials);

      httpClient.setAccessToken(tokens.access_token);
      login(user, tokens);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : 'Admin login failed. Please check your credentials.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async logout(): Promise<void> {
    const {logout, setLoading, setError} = useAuthStore.getState();

    try {
      setLoading(true);
      setError(null);

      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }

      httpClient.setAccessToken(null);
      logout();
    } catch (error) {
      setError('Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async logoutAllDevices(): Promise<void> {
    const {logout, setLoading, setError} = useAuthStore.getState();

    try {
      setLoading(true);
      setError(null);

      await authApi.logoutAllDevices();
      httpClient.setAccessToken(null);
      logout();
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to logout from all devices';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async refreshToken(): Promise<void> {
    const {tokens, setTokens, logout, setError} = useAuthStore.getState();
    if (!tokens?.refresh_token) throw new Error('No refresh token available');

    try {
      const newTokens = await authApi.refreshToken(tokens.refresh_token);
      httpClient.setAccessToken(newTokens.access_token);
      setTokens(newTokens);
    } catch (error) {
      setError('Session expired. Please login again.');
      httpClient.setAccessToken(null);
      logout();
      throw error;
    }
  }

  isAuthenticated(): boolean {
    const {isAuthenticated, tokens} = useAuthStore.getState();
    return isAuthenticated && !!tokens?.access_token;
  }

  getCurrentUser() {
    const {user} = useAuthStore.getState();
    return user;
  }

  setupTokenRefresh() {
    const {tokens} = useAuthStore.getState();
    if (!tokens || !tokens.expires_in) return;
    const expiresAt = Date.now() + (tokens.expires_in - 300) * 1000;
    const refreshIn = Math.max(0, expiresAt - Date.now());
    if (refreshIn < 60000) return;
    setTimeout(() => {
      this.refreshToken().catch((error) => {
        console.error('Auto token refresh failed:', error);
      });
    }, refreshIn);
  }
}

export const authService = AuthService.getInstance();
