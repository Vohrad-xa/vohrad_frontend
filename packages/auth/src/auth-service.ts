import {authApi, errorManager, httpClient} from '@sykamore/api-client';
import {useAuthStore} from '@sykamore/store';
import {
  ApiError,
  type AuthTokens,
  type MobileOidcLoginParams,
  validation,
} from '@sykamore/types';

type GlobalWithEnv = {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

declare const process: {
  env: Record<string, string | undefined>;
};

const WEB_CSRF_COOKIE_NAME = 'sykamore_csrf_token';
const MOBILE_DEFAULT_SCOPES = [
  'openid',
  'sykamore-claims',
  'sykamore-audience',
  'offline_access',
];

type MobileOidcClientConfig = {
  issuerUrl: string;
  mobileClientId: string;
  scopes: string[];
  mobileRedirectUri: string | null;
};

const inlineEnv: Record<string, string | undefined> = {
  EXPO_PUBLIC_OIDC_ISSUER_URL: process.env.EXPO_PUBLIC_OIDC_ISSUER_URL,
  EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID:
    process.env.EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID,
  EXPO_PUBLIC_OIDC_MOBILE_SCOPES: process.env.EXPO_PUBLIC_OIDC_MOBILE_SCOPES,
  EXPO_PUBLIC_OIDC_MOBILE_REDIRECT_URI:
    process.env.EXPO_PUBLIC_OIDC_MOBILE_REDIRECT_URI,
  NEXT_PUBLIC_OIDC_ISSUER_URL: process.env.NEXT_PUBLIC_OIDC_ISSUER_URL,
  NEXT_PUBLIC_OIDC_MOBILE_CLIENT_ID:
    process.env.NEXT_PUBLIC_OIDC_MOBILE_CLIENT_ID,
  NEXT_PUBLIC_OIDC_MOBILE_SCOPES: process.env.NEXT_PUBLIC_OIDC_MOBILE_SCOPES,
  NEXT_PUBLIC_OIDC_MOBILE_REDIRECT_URI:
    process.env.NEXT_PUBLIC_OIDC_MOBILE_REDIRECT_URI,
};

const envFromGlobal = (() => {
  try {
    return (globalThis as GlobalWithEnv).process?.env;
  } catch {
    return undefined;
  }
})();

const readEnv = (keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = inlineEnv[key] ?? envFromGlobal?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const parseScopes = (value?: string): string[] => {
  if (!value) return MOBILE_DEFAULT_SCOPES;

  const parsed = value
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);

  return parsed.length > 0 ? parsed : MOBILE_DEFAULT_SCOPES;
};

let cachedMobileOidcConfig: MobileOidcClientConfig | null = null;

export function getMobileOidcClientConfig(): MobileOidcClientConfig {
  if (cachedMobileOidcConfig) {
    return cachedMobileOidcConfig;
  }

  const issuerUrl = readEnv([
    'EXPO_PUBLIC_OIDC_ISSUER_URL',
    'NEXT_PUBLIC_OIDC_ISSUER_URL',
  ]);
  const mobileClientId = readEnv([
    'EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID',
    'NEXT_PUBLIC_OIDC_MOBILE_CLIENT_ID',
  ]);
  const scopeValue = readEnv([
    'EXPO_PUBLIC_OIDC_MOBILE_SCOPES',
    'NEXT_PUBLIC_OIDC_MOBILE_SCOPES',
  ]);
  const mobileRedirectUriValue = readEnv([
    'EXPO_PUBLIC_OIDC_MOBILE_REDIRECT_URI',
    'NEXT_PUBLIC_OIDC_MOBILE_REDIRECT_URI',
  ]);

  if (!issuerUrl) {
    throw new Error(
      'OIDC issuer URL is not configured. Set EXPO_PUBLIC_OIDC_ISSUER_URL.',
    );
  }

  if (!mobileClientId) {
    throw new Error(
      'OIDC mobile client ID is not configured. Set EXPO_PUBLIC_OIDC_MOBILE_CLIENT_ID.',
    );
  }

  cachedMobileOidcConfig = {
    issuerUrl: issuerUrl.replace(/\/+$/, ''),
    mobileClientId,
    scopes: parseScopes(scopeValue),
    mobileRedirectUri: mobileRedirectUriValue ?? null,
  };

  return cachedMobileOidcConfig;
}

export class AuthService {
  private static instance: AuthService;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  // Single-flight refresh: ensures only one token refresh runs at a time
  private refreshPromise: Promise<void> | null = null;
  private static readonly NETWORK_RETRY_DELAY_MS = 60_000;
  private mobileTokenEndpoint: string | null = null;

  private constructor() {
    this.setupAutoRefresh();
    this.syncTokenStateWithPlatform();
    httpClient.setTokenRefreshHandler(() => this.refreshToken());

    // To keep refresh scheduling in sync with persisted token hydration and later updates.
    let lastTokens = useAuthStore.getState().tokens;
    this.syncRefreshSchedule(lastTokens);
    useAuthStore.subscribe((state) => {
      if (state.tokens !== lastTokens) {
        lastTokens = state.tokens;
        this.syncRefreshSchedule(lastTokens);
      }
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async startWebLogin(
    returnTo = '/',
    options?: {setupPasskey?: boolean},
  ): Promise<void> {
    if (!this.isWebRuntime()) {
      throw new Error('startWebLogin is only available in web runtime');
    }

    const {setLoading} = useAuthStore.getState();

    try {
      setLoading(true);

      const redirectTarget =
        returnTo && returnTo.trim().length > 0 ? returnTo.trim() : '/';

      const loginUrl = authApi.getOidcStartUrl(redirectTarget, options);
      window.location.assign(loginUrl);
    } catch (error) {
      setLoading(false);

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start Keycloak sign-in flow';
      errorManager.reportError(message);
      throw error;
    }
  }

  async completeMobileOidcLogin(params: MobileOidcLoginParams): Promise<void> {
    const {setLoading, login} = useAuthStore.getState();

    try {
      setLoading(true);

      // Pre-seed the token endpoint cache if the caller already fetched discovery,
      // so getMobileTokenEndpoint() skips a redundant network request.
      if (params.tokenEndpoint && !this.mobileTokenEndpoint) {
        this.mobileTokenEndpoint = params.tokenEndpoint;
      }

      const tokens = await this.exchangeMobileAuthorizationCode({
        code: params.code,
        codeVerifier: params.codeVerifier,
        redirectUri: params.redirectUri,
      });

      const tokensResult = validation.validateAuthTokens(tokens);
      if (!tokensResult.success) {
        throw new Error('Invalid mobile token response from Keycloak');
      }

      if (!tokensResult.data.refresh_token) {
        throw new Error(
          'OIDC mobile flow did not return a refresh token (offline_access missing)',
        );
      }

      // Set the access token on the http client before calling getMeProfile,
      httpClient.setAccessToken(tokensResult.data.access_token);

      const user = await authApi.getMeProfile();
      const userResult = validation.validateIdentity(user);
      if (!userResult.success) {
        throw new Error('Invalid user data received from API');
      }

      await this.loadAndActivateDefaultTenant();

      login(userResult.data, tokensResult.data);
      this.scheduleTokenRefresh(tokensResult.data);
    } catch (error) {
      // If login didn't complete, clear any token that was set on the http client.
      httpClient.setAccessToken(null);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Login failed. Please try again.';
      const statusCode = error instanceof ApiError ? error.status : undefined;
      errorManager.reportError(message, statusCode);
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
        if (this.isWebRuntime()) {
          const csrfToken = this.readWebCsrfToken();
          await authApi.logoutWebSession(csrfToken);
        } else {
          await authApi.logout();
        }
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }

      httpClient.setTenantId(null);
      this.clearRefreshTimer();
      logout();
    } catch (error) {
      errorManager.reportError('Logout failed');
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
      httpClient.setTenantId(null);
      this.clearRefreshTimer();
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
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const {tokens, setTokens, logout} = useAuthStore.getState();

    this.refreshPromise = (async () => {
      try {
        const refreshedTokens = this.isWebRuntime()
          ? await this.issueWebAccessTokenFromCookie()
          : await this.refreshMobileAccessToken(tokens?.refresh_token);

        const tokensResult = validation.validateAuthTokens(refreshedTokens);
        if (!tokensResult.success) {
          throw new Error('Invalid token response from refresh flow');
        }

        const mergedTokens =
          !this.isWebRuntime() &&
          !tokensResult.data.refresh_token &&
          tokens?.refresh_token
            ? {
                ...tokensResult.data,
                refresh_token: tokens.refresh_token,
              }
            : tokensResult.data;

        setTokens(mergedTokens);
        this.scheduleTokenRefresh(mergedTokens);
      } catch (error) {
        const isNetworkError = error instanceof ApiError && error.status === 0;
        if (isNetworkError) {
          this.scheduleNetworkRetry();
          throw error;
        }

        errorManager.reportError('Session expired. Please login again.', 401);
        this.clearRefreshTimer();
        logout();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async restoreSessionFromCookie(): Promise<boolean> {
    if (!this.isWebRuntime()) {
      return false;
    }

    const {login} = useAuthStore.getState();

    try {
      const tokens = await this.issueWebAccessTokenFromCookie();

      const tokensResult = validation.validateAuthTokens(tokens);
      if (!tokensResult.success) {
        return false;
      }

      // Set the access token before calling getMeProfile,
      httpClient.setAccessToken(tokensResult.data.access_token);

      const user = await authApi.getMeProfile();
      const userResult = validation.validateIdentity(user);
      if (!userResult.success) {
        httpClient.setAccessToken(null);
        return false;
      }

      // activate tenant before login()
      await this.loadAndActivateDefaultTenant();

      login(userResult.data, tokensResult.data);
      this.scheduleTokenRefresh(tokensResult.data);

      return true;
    } catch {
      httpClient.setAccessToken(null);
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

  /**
   * Fetch membership list and activate the default tenant workspace.
   * Silently fails — a missing tenant list should not block login.
   */
  private async loadAndActivateDefaultTenant(): Promise<void> {
    const {setMemberships, setSelectedTenantId} = useAuthStore.getState();

    const clearTenantContext = () => {
      setMemberships([]);
      setSelectedTenantId(null);
      httpClient.setTenantId(null);
    };

    try {
      const memberships = await authApi.getMyTenants();
      const membershipsResult =
        validation.validateTenantMemberships(memberships);

      if (!membershipsResult.success) {
        clearTenantContext();
        return;
      }

      setMemberships(membershipsResult.data);

      const defaultTenant =
        membershipsResult.data.find((m) => m.is_default) ??
        membershipsResult.data[0];

      if (defaultTenant) {
        httpClient.setTenantId(defaultTenant.id);
        setSelectedTenantId(defaultTenant.id);
        return;
      }

      clearTenantContext();
    } catch (error) {
      console.warn('[auth] Failed to load tenant memberships:', error);
      clearTenantContext();
    }
  }

  private syncTokenStateWithPlatform(): void {
    if (this.isWebRuntime()) {
      httpClient.setAccessToken(
        useAuthStore.getState().tokens?.access_token ?? null,
      );
    }
  }

  private isWebRuntime(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private readWebCsrfToken(): string {
    if (!this.isWebRuntime()) {
      throw new Error('CSRF cookie is only available in web runtime');
    }

    const cookieValue = document.cookie
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${WEB_CSRF_COOKIE_NAME}=`));

    if (!cookieValue) {
      throw new Error(
        'Missing CSRF cookie. Start login from /auth/oidc/start.',
      );
    }

    return decodeURIComponent(
      cookieValue.slice(WEB_CSRF_COOKIE_NAME.length + 1),
    );
  }

  private async issueWebAccessTokenFromCookie(): Promise<AuthTokens> {
    const csrfToken = this.readWebCsrfToken();
    return authApi.issueWebAccessToken(csrfToken);
  }

  private async exchangeMobileAuthorizationCode(params: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Promise<AuthTokens> {
    const oidcConfig = getMobileOidcClientConfig();
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: oidcConfig.mobileClientId,
      code: params.code,
      code_verifier: params.codeVerifier,
      redirect_uri: params.redirectUri,
    });

    return this.requestMobileTokenGrant(body);
  }

  private async refreshMobileAccessToken(
    refreshToken: string | undefined,
  ): Promise<AuthTokens> {
    if (!refreshToken || refreshToken.length === 0) {
      throw new Error('No refresh token available for mobile session');
    }

    const oidcConfig = getMobileOidcClientConfig();
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: oidcConfig.mobileClientId,
      refresh_token: refreshToken,
    });

    return this.requestMobileTokenGrant(body);
  }

  private async requestMobileTokenGrant(
    body: URLSearchParams,
  ): Promise<AuthTokens> {
    const tokenEndpoint = await this.getMobileTokenEndpoint();

    let response: Response;
    try {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
    } catch (error) {
      throw new ApiError(
        error instanceof Error
          ? error.message
          : 'Unable to reach OIDC token endpoint',
        0,
      );
    }

    if (!response.ok) {
      throw new ApiError('OIDC token grant failed', response.status);
    }

    const payload = (await response.json()) as AuthTokens;
    return {
      ...payload,
      issued_at: Date.now(),
    };
  }

  private async getMobileTokenEndpoint(): Promise<string> {
    if (this.mobileTokenEndpoint) {
      return this.mobileTokenEndpoint;
    }

    const issuer = getMobileOidcClientConfig().issuerUrl;
    const discoveryUrl = `${issuer}/.well-known/openid-configuration`;

    let response: Response;
    try {
      response = await fetch(discoveryUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch (error) {
      throw new ApiError(
        error instanceof Error
          ? error.message
          : 'Unable to reach OIDC discovery endpoint',
        0,
      );
    }

    if (!response.ok) {
      throw new ApiError(
        'Failed to load OIDC discovery metadata',
        response.status,
      );
    }

    const payload = (await response.json()) as {token_endpoint?: string};
    if (!payload.token_endpoint || payload.token_endpoint.length === 0) {
      throw new Error('OIDC discovery metadata is missing token_endpoint');
    }

    this.mobileTokenEndpoint = payload.token_endpoint;
    return this.mobileTokenEndpoint;
  }

  private syncRefreshSchedule(tokens: AuthTokens | null | undefined): void {
    if (tokens?.access_token) {
      this.scheduleTokenRefresh(tokens);
      return;
    }
    this.clearRefreshTimer();
  }

  private setupAutoRefresh(): void {
    this.syncRefreshSchedule(useAuthStore.getState().tokens);
  }

  private scheduleNetworkRetry(): void {
    this.clearRefreshTimer();
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(() => {
        // further handling occurs in refreshToken catch.
      });
    }, AuthService.NETWORK_RETRY_DELAY_MS);
  }

  private scheduleTokenRefresh(tokens: AuthTokens): void {
    this.clearRefreshTimer();

    if (!tokens.expires_in || !tokens.issued_at) return;

    // Refresh 60 seconds before expiry.
    const refreshBuffer = 60 * 1000;
    const tokenLifetime = tokens.expires_in * 1000;
    const elapsedTime = Date.now() - tokens.issued_at;
    const timeUntilRefresh = Math.max(
      0,
      tokenLifetime - refreshBuffer - elapsedTime,
    );

    if (timeUntilRefresh > 0) {
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
