import {useAuthStore} from '@vohrad/store';
import type {UserLoginRequest, AdminLoginRequest, AuthTokens} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {authApi} from '@vohrad/api-client';
import {httpClient, setApiTenant} from '@vohrad/api-client';

export class AuthService {
  private static instance: AuthService;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing = false;

  private constructor() {
    this.syncTokenFromStore();
    this.setupAutoRefresh();

    httpClient.setTokenRefreshHandler(() => this.refreshToken());

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

  async loginUser(email: string, password: string, subdomain: string): Promise<void> {
    const {setLoading, setError, login} = useAuthStore.getState();

    try {
      setLoading(true);
      setError(null);

      // Set tenant subdomain before making API call
      setApiTenant(subdomain);

      const credentials: UserLoginRequest = {email, password};
      const {tokens, user} = await authApi.loginUser(credentials);

      httpClient.setAccessToken(tokens.access_token);
      login(user, tokens);
      this.scheduleTokenRefresh(tokens);
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
      this.scheduleTokenRefresh(tokens);
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
      this.clearRefreshTimer();
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
      this.clearRefreshTimer();
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

    if (this.isRefreshing) return;
    this.isRefreshing = true;

    try {
      const newTokens = await authApi.refreshToken(tokens.refresh_token);
      httpClient.setAccessToken(newTokens.access_token);
      setTokens(newTokens);
      this.scheduleTokenRefresh(newTokens);
    } catch (error) {
      setError('Session expired. Please login again.');
      httpClient.setAccessToken(null);
      this.clearRefreshTimer();
      logout();
      throw error;
    } finally {
      this.isRefreshing = false;
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

  private setupAutoRefresh(): void {
    const {tokens} = useAuthStore.getState();
    if (tokens?.access_token && tokens.expires_in) {
      this.scheduleTokenRefresh(tokens);
    }
  }

  private scheduleTokenRefresh(tokens: AuthTokens): void {
    this.clearRefreshTimer();

    if (!tokens.expires_in || !tokens.issued_at) return;

    // Calculate refresh time: 25 minutes (5 minute buffer before 30 min expiration)
    const refreshBuffer = 5 * 60 * 1000;
    const tokenLifetime = tokens.expires_in * 1000;
    const elapsedTime = Date.now() - tokens.issued_at;
    const timeUntilRefresh = Math.max(0, tokenLifetime - refreshBuffer - elapsedTime);

    // Only schedule if we have at least 1 minute before refresh
    if (timeUntilRefresh > 60000) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken().catch((error) => {
          console.error('Auto token refresh failed:', error);
        });
      }, timeUntilRefresh);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

export const authService = AuthService.getInstance();
