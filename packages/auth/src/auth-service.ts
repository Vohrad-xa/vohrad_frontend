import {useAuthStore} from '@vohrad/store';
import type {AuthTokens} from '@vohrad/types';
import {ApiError, validation} from '@vohrad/types';
import {authApi, tenantApi, errorManager} from '@vohrad/api-client';
import {httpClient, setApiTenant} from '@vohrad/api-client';

export class AuthService {
  private static instance: AuthService;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  // Single-flight refresh: ensures only one token refresh runs at a time
  private refreshPromise: Promise<void> | null = null;
  private static readonly NETWORK_RETRY_DELAY_MS = 60_000;

  private constructor() {
    this.setupAutoRefresh();
    httpClient.setTokenRefreshHandler(() => this.refreshToken());
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
    const {setLoading, login} = useAuthStore.getState();

    try {
      setLoading(true);

      // Set tenant subdomain before making API call
      setApiTenant(subdomain);

      // Validate credentials with validation function
      const credentialsResult = validation.validateUserLogin({email, password});
      if (!credentialsResult.success) {
        const errorMessage =
          validation.getValidationErrorMessage(credentialsResult);
        errorManager.reportError(errorMessage, 400);
        throw new Error(errorMessage);
      }

      const {tokens, user} = await authApi.loginUser(credentialsResult.data);

      // Validate API response data
      const tokensResult = validation.validateAuthTokens(tokens);
      if (!tokensResult.success) {
        console.error('Invalid token response from API:', tokensResult.error);
        throw new Error('Invalid authentication response');
      }

      const userResult = validation.validateUser(user);
      if (!userResult.success) {
        console.error('Invalid user data from API:', userResult.error);
        throw new Error('Invalid user data received');
      }

      // login() automatically syncs token to httpClient
      login(userResult.data, tokensResult.data);
      this.scheduleTokenRefresh(tokensResult.data);

      // Fetch tenant data after successful login
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
      const statusCode = error instanceof ApiError ? error.status : undefined;
      errorManager.reportError(errorMessage, statusCode);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async loginAdmin(email: string, password: string): Promise<void> {
    const {setLoading, login} = useAuthStore.getState();

    try {
      setLoading(true);

      // Validate credentials with validation function
      const credentialsResult = validation.validateAdminLogin({
        email,
        password,
      });
      if (!credentialsResult.success) {
        const errorMessage =
          validation.getValidationErrorMessage(credentialsResult);
        errorManager.reportError(errorMessage, 400);
        throw new Error(errorMessage);
      }

      const {tokens, user} = await authApi.loginAdmin(credentialsResult.data);

      // Validate API response data
      const tokensResult = validation.validateAuthTokens(tokens);
      if (!tokensResult.success) {
        console.error('Invalid token response from API:', tokensResult.error);
        throw new Error('Invalid authentication response');
      }

      const userResult = validation.validateUser(user);
      if (!userResult.success) {
        console.error('Invalid user data from API:', userResult.error);
        throw new Error('Invalid user data received');
      }

      // login() automatically syncs token to httpClient
      login(userResult.data, tokensResult.data);
      this.scheduleTokenRefresh(tokensResult.data);

      // Fetch tenant data after successful login
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
      const statusCode = error instanceof ApiError ? error.status : undefined;
      errorManager.reportError(errorMessage, statusCode);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async logout(): Promise<void> {
    const {logout, setLoading} = useAuthStore.getState();

    try {
      setLoading(true);

      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }

      this.clearRefreshTimer();
      // logout() automatically clears token from httpClient
      logout();
    } catch (error) {
      const errorMessage = 'Logout failed';
      errorManager.reportError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async logoutAllDevices(): Promise<void> {
    const {logout, setLoading} = useAuthStore.getState();

    try {
      setLoading(true);

      await authApi.logoutAllDevices();
      this.clearRefreshTimer();
      // logout() automatically clears token from httpClient
      logout();
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : 'Failed to logout from all devices';
      const statusCode = error instanceof ApiError ? error.status : undefined;
      errorManager.reportError(errorMessage, statusCode);
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

    const {tokens, setTokens, logout} = useAuthStore.getState();
    // Native apps persist the refresh token; the web build relies on cookies.
    const refreshSource = tokens?.refresh_token;
    if (!refreshSource && typeof window === 'undefined') {
      throw new Error('No refresh token available');
    }

    // Cache promise to ensure all concurrent callers wait for same refresh
    this.refreshPromise = (async () => {
      try {
        const newTokens = await authApi.refreshToken(refreshSource);

        // Validate refreshed tokens
        const tokensResult = validation.validateAuthTokens(newTokens);
        if (!tokensResult.success) {
          console.error(
            'Invalid token response from refresh API:',
            tokensResult.error,
          );
          throw new Error('Invalid token response');
        }

        // setTokens() automatically syncs to httpClient
        setTokens(tokensResult.data);
        this.scheduleTokenRefresh(tokensResult.data);
      } catch (error) {
        const isNetworkError = error instanceof ApiError && error.status === 0;
        if (isNetworkError) {
          this.scheduleNetworkRetry();
          throw error;
        }
        const errorMessage = 'Session expired. Please login again.';
        errorManager.reportError(errorMessage, 401);
        this.clearRefreshTimer();
        // logout() automatically clears token from httpClient
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
      const user = await authApi.getCurrentUser();

      // Validate API response data
      const tokensResult = validation.validateAuthTokens(tokens);
      if (!tokensResult.success) {
        console.error(
          'Invalid token response from API during session restore:',
          tokensResult.error,
        );
        return false;
      }

      const userResult = validation.validateUser(user);
      if (!userResult.success) {
        console.error(
          'Invalid user data from API during session restore:',
          userResult.error,
        );
        return false;
      }

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

      // login() automatically syncs token to httpClient
      login(userResult.data, tokensResult.data);
      this.scheduleTokenRefresh(tokensResult.data);
      return true;
    } catch (_error) {
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

  private scheduleNetworkRetry(): void {
    this.clearRefreshTimer();
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(() => {
        // Intentionally swallow; further handling occurs in refreshToken catch.
      });
    }, AuthService.NETWORK_RETRY_DELAY_MS);
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
