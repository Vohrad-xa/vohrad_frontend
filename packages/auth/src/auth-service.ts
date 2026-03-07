import {authApi, errorManager, httpClient} from '@sykamore/api-client';
import {useAuthStore} from '@sykamore/store';
import {
  ApiError,
  validateAuthTokens,
  validateIdentity,
  validateMobileOidcLoginParams,
  validateStartWebLoginOptions,
  validateTenantMemberships,
  type AuthTokens,
  type MobileOidcLoginParams,
  type StartWebLoginOptions,
} from '@sykamore/types';

const WEB_CSRF_COOKIE_NAME = 'sykamore_csrf_token';

export type MobileOidcConfig = {
  issuerUrl: string;
  mobileClientId: string;
  scopes: string[];
  mobileRedirectUri?: string;
};

export type AppleTokenExchangeUserProfile = {
  name?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
};

type SocialProvider = 'apple' | 'google';
type MobileRefreshFlow = 'oidc_direct' | 'social_exchange';

let mobileOidcConfig: MobileOidcConfig | null = null;

export function initMobileOidcConfig(config: MobileOidcConfig): void {
  mobileOidcConfig = config;
}

export function getMobileOidcClientConfig(): MobileOidcConfig {
  if (!mobileOidcConfig) {
    throw new Error(
      'OIDC config not initialized. Call initMobileOidcConfig() at app startup.',
    );
  }
  return mobileOidcConfig;
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
    options?: StartWebLoginOptions,
  ): Promise<void> {
    if (!this.isWebRuntime()) {
      throw new Error('startWebLogin is only available in web runtime');
    }

    const {setLoading} = useAuthStore.getState();

    try {
      setLoading(true);

      const optionsResult = validateStartWebLoginOptions(options ?? {});
      if (!optionsResult.success) {
        throw new Error('Invalid web login options');
      }

      const redirectTarget =
        returnTo && returnTo.trim().length > 0 ? returnTo.trim() : '/';

      const loginUrl = authApi.getOidcStartUrl(
        redirectTarget,
        optionsResult.data,
      );
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
    const {setLoading} = useAuthStore.getState();

    try {
      setLoading(true);

      const paramsResult = validateMobileOidcLoginParams(params);
      if (!paramsResult.success) {
        throw new Error('Invalid mobile OIDC login params');
      }
      const validatedParams = paramsResult.data;

      // Pre-seed the token endpoint cache if the caller already fetched discovery,
      // so getMobileTokenEndpoint() skips a redundant network request.
      if (validatedParams.tokenEndpoint && !this.mobileTokenEndpoint) {
        this.mobileTokenEndpoint = validatedParams.tokenEndpoint;
      }

      const tokens = await this.exchangeMobileAuthorizationCode({
        code: validatedParams.code,
        codeVerifier: validatedParams.codeVerifier,
        redirectUri: validatedParams.redirectUri,
      });
      await this.finalizeMobileLogin({
        ...tokens,
        refresh_flow: 'oidc_direct',
      });
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

  async completeMobileAppleLogin(params: {
    idToken: string;
    userProfile?: AppleTokenExchangeUserProfile;
  }): Promise<void> {
    return this.completeMobileSocialLogin({
      provider: 'apple',
      token: params.idToken,
      userProfile: params.userProfile,
    });
  }

  async completeMobileGoogleLogin(params: {
    accessToken: string;
  }): Promise<void> {
    return this.completeMobileSocialLogin({
      provider: 'google',
      token: params.accessToken,
    });
  }

  private async completeMobileSocialLogin(params: {
    provider: SocialProvider;
    token: string;
    userProfile?: AppleTokenExchangeUserProfile;
  }): Promise<void> {
    const {setLoading} = useAuthStore.getState();

    try {
      setLoading(true);

      const tokens = await authApi.exchangeSocialToken({
        provider: params.provider,
        token: params.token,
        userProfile: params.userProfile,
      });

      await this.finalizeMobileLogin({
        ...tokens,
        refresh_flow: 'social_exchange',
      });
    } catch (error) {
      httpClient.setAccessToken(null);
      const message =
        error instanceof ApiError
          ? error.message
          : `${params.provider} sign in failed. Please try again.`;
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
          : await this.refreshMobileAccessToken(tokens);

        const tokensResult = validateAuthTokens(refreshedTokens);
        if (!tokensResult.success) {
          throw new Error('Invalid token response from refresh flow');
        }

        const mergedTokens =
          !this.isWebRuntime() &&
          (!tokensResult.data.refresh_token || !tokensResult.data.refresh_flow)
            ? {
                ...tokensResult.data,
                refresh_token:
                  tokensResult.data.refresh_token ?? tokens?.refresh_token,
                refresh_flow:
                  tokensResult.data.refresh_flow ?? tokens?.refresh_flow,
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

      const tokensResult = validateAuthTokens(tokens);
      if (!tokensResult.success) {
        return false;
      }

      // Set the access token before calling getMeProfile,
      httpClient.setAccessToken(tokensResult.data.access_token);

      const user = await authApi.getMeProfile();
      const userResult = validateIdentity(user);
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
      const membershipsResult = validateTenantMemberships(memberships);

      if (!membershipsResult.success) {
        clearTenantContext();
        return;
      }

      setMemberships(membershipsResult.data);

      const defaultTenant =
        membershipsResult.data.find((m) => m.is_default) ??
        membershipsResult.data[0];

      if (defaultTenant) {
        httpClient.setTenantId(defaultTenant.tenant_id);
        setSelectedTenantId(defaultTenant.tenant_id);
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
    tokens: AuthTokens | null | undefined,
  ): Promise<AuthTokens> {
    const refreshToken = tokens?.refresh_token;
    if (!refreshToken || refreshToken.length === 0) {
      throw new Error('No refresh token available for mobile session');
    }

    const refreshFlow = this.resolveMobileRefreshFlow(tokens);
    if (refreshFlow === 'social_exchange') {
      return authApi.refreshSocialToken({refreshToken});
    }

    const oidcConfig = getMobileOidcClientConfig();
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: oidcConfig.mobileClientId,
      refresh_token: refreshToken,
    });

    try {
      return await this.requestMobileTokenGrant(body);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message.toLowerCase().includes("authorized client don't match")
      ) {
        return authApi.refreshSocialToken({refreshToken});
      }
      throw error;
    }
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
      const message = await this.buildOidcGrantErrorMessage(response);
      throw new ApiError(message, response.status);
    }

    const payload = (await response.json()) as AuthTokens;
    return {
      ...payload,
      issued_at: Date.now(),
    };
  }

  private async buildOidcGrantErrorMessage(
    response: Response,
  ): Promise<string> {
    try {
      const payload = (await response.json()) as {
        error?: string;
        error_description?: string;
      };
      const errorCode = payload?.error;
      const description = payload?.error_description;
      if (
        typeof errorCode === 'string' &&
        errorCode.length > 0 &&
        typeof description === 'string' &&
        description.length > 0
      ) {
        return `OIDC token grant failed: ${errorCode} (${description})`;
      }
      if (typeof description === 'string' && description.length > 0) {
        return `OIDC token grant failed: ${description}`;
      }
      if (typeof errorCode === 'string' && errorCode.length > 0) {
        return `OIDC token grant failed: ${errorCode}`;
      }
    } catch {
      // Fall through to default message.
    }
    return 'OIDC token grant failed';
  }

  private resolveMobileRefreshFlow(
    tokens: AuthTokens | null | undefined,
  ): MobileRefreshFlow {
    if (tokens?.refresh_flow === 'social_exchange') {
      return 'social_exchange';
    }
    return 'oidc_direct';
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

  private async finalizeMobileLogin(tokens: AuthTokens): Promise<void> {
    const {login} = useAuthStore.getState();
    const tokensResult = validateAuthTokens(tokens);
    if (!tokensResult.success) {
      throw new Error('Invalid mobile token response from Keycloak');
    }

    if (!tokensResult.data.refresh_token) {
      throw new Error(
        'OIDC mobile flow did not return a refresh token (offline_access missing)',
      );
    }

    // Set token before profile fetch.
    httpClient.setAccessToken(tokensResult.data.access_token);

    const user = await authApi.getMeProfile();
    const userResult = validateIdentity(user);
    if (!userResult.success) {
      throw new Error('Invalid user data received from API');
    }

    await this.loadAndActivateDefaultTenant();
    login(userResult.data, tokensResult.data);
    this.scheduleTokenRefresh(tokensResult.data);
  }
}

export const authService = AuthService.getInstance();
