import {useAuthStore} from '@vohrad/store';
import type {
  UserLoginRequest,
  AdminLoginRequest,
  AuthTokens,
} from '@vohrad/types';
import {ApiError} from '@vohrad/types';
import {authApi, tenantApi} from '@vohrad/api-client';
import {httpClient, setApiTenant} from '@vohrad/api-client';

export class AuthService {
  private static instance: AuthService;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  // Single-flight refresh: ensures only one token refresh runs at a time
  private refreshPromise: Promise<void> | null = null;

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

  async loginUser(
    email: string,
    password: string,
    subdomain: string,
  ): Promise<void> {
    const {setLoading, setError, login} = useAuthStore.getState();

    try {
      setLoading(true);
      setError(null);

      // Set tenant subdomain before making API call
      setApiTenant(subdomain);

      const credentials: UserLoginRequest = {email, password};
      const {tokens, user} = await authApi.loginUser(credentials);

      // Explicitly set access token in httpClient before fetching tenant
      httpClient.setAccessToken(tokens.access_token);

      // Set tokens in store
      login(user, tokens);
      this.scheduleTokenRefresh(tokens);

      // Fetch tenant data after successful login (after token is set)
      try {
        const tenant = await tenantApi.getTenantInfo();
        const {setTenant} = useAuthStore.getState();
        setTenant(tenant);
      } catch (error) {
        console.warn('Failed to fetch tenant info:', error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Login failed. Please check your credentials.';
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

      // Set tokens in store first
      login(user, tokens);
      this.scheduleTokenRefresh(tokens);

      // Fetch tenant data after successful login (after token is set)
      try {
        const tenant = await tenantApi.getTenantInfo();
        const {setTenant} = useAuthStore.getState();
        setTenant(tenant);
      } catch (error) {
        console.warn('Failed to fetch tenant info:', error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Admin login failed. Please check your credentials.';
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
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Failed to logout from all devices';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async refreshToken(): Promise<void> {
    // Return existing promise if refresh already in progress
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const {tokens, setTokens, logout, setError} = useAuthStore.getState();
    // Native apps persist the refresh token; the web build relies on cookies.
    const refreshSource = tokens?.refresh_token;
    if (!refreshSource && typeof window === 'undefined') {
      throw new Error('No refresh token available');
    }

    // Cache promise to ensure all concurrent callers wait for same refresh
    this.refreshPromise = (async () => {
      try {
        const newTokens = await authApi.refreshToken(refreshSource);
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
        // Clear promise to allow future refreshes
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async restoreSessionFromCookie(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    const {login} = useAuthStore.getState();

    try {
      // Trigger cookie-based refresh and then hydrate user + timers.
      const tokens = await authApi.refreshToken();
      httpClient.setAccessToken(tokens.access_token);
      const user = await authApi.getCurrentUser();

      // Fetch tenant data during session restore
      try {
        const tenant = await tenantApi.getTenantInfo();
        const {setTenant} = useAuthStore.getState();
        setTenant(tenant);
      } catch (error) {
        console.warn(
          'Failed to fetch tenant info during session restore:',
          error,
        );
      }

      login(user, tokens);
      this.scheduleTokenRefresh(tokens);
      return true;
    } catch (_error) {
      httpClient.setAccessToken(null);
      // Cookie missing or invalid: leave the store in a signed-out state.
      return false;
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
    const timeUntilRefresh = Math.max(
      0,
      tokenLifetime - refreshBuffer - elapsedTime,
    );

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
