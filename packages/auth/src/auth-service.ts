import {authApi, httpClient} from '@sykamore/api-client';
import type {ApiError} from '@sykamore/types';
import {
  validateAuthTokens,
  validateMobileAppleLoginParams,
  validateStartWebLoginOptions,
  type AuthTokens,
  type MobileAppleLoginParams,
  type MobileOidcLoginParams,
  type MobileOidcConfig,
  type OidcDiscoveryDocument,
  type StartWebLoginOptions,
} from '@sykamore/types';
import {
  getMobileOidcClientConfig,
  initMobileOidcConfig,
} from './config/mobile-oidc-config';
import {
  createSessionExpiredError,
  createSignInStateError,
} from './core/auth-client-errors';
import {isWebRuntime} from './core/platform';
import {authStoreAdapter} from './core/store-adapter';
import {MobileAppleClient} from './flows/mobile-apple-client';
import {MobileOidcClient} from './flows/mobile-oidc-client';
import {WebSessionClient} from './flows/web-session-client';
import {RefreshRuntimeController} from './session/refresh-runtime';
import {classifyRefreshFailure} from './session/refresh-failure';
import {SessionBootstrapper} from './session/session-bootstrap';

export class AuthService {
  private static instance: AuthService | null = null;
  private readonly webSessionClient = new WebSessionClient();
  private readonly mobileAppleClient = new MobileAppleClient();
  private readonly mobileOidcClient = new MobileOidcClient();
  private readonly sessionBootstrapper = new SessionBootstrapper();
  private readonly refreshRuntime = new RefreshRuntimeController(() =>
    this.refreshToken(),
  );
  private refreshPromise: Promise<void> | null = null;

  private constructor() {
    httpClient.setTokenRefreshHandler(() => this.refreshToken());
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  startRuntime(): void {
    this.refreshRuntime.start();
  }

  stopRuntime(): void {
    this.refreshRuntime.stop();
  }

  resetSession(): void {
    this.refreshRuntime.cancelScheduledRefresh();
    authStoreAdapter.resetSession();
  }

  async fetchMobileOidcDiscovery(): Promise<OidcDiscoveryDocument> {
    return this.mobileOidcClient.fetchDiscoveryDocument();
  }

  async startWebLogin(
    returnTo = '/',
    options?: StartWebLoginOptions,
  ): Promise<void> {
    if (!isWebRuntime()) {
      throw new Error(
        'Web sign-in is only available in a browser environment.',
      );
    }

    authStoreAdapter.setLoading(true);

    try {
      const optionsResult = validateStartWebLoginOptions(options ?? {});
      if (!optionsResult.success) {
        throw new Error('Web sign-in options are invalid.');
      }

      const redirectTarget =
        returnTo && returnTo.trim().length > 0 ? returnTo.trim() : '/';
      this.webSessionClient.redirectToLogin(redirectTarget, optionsResult.data);
    } catch (error) {
      authStoreAdapter.setLoading(false);
      throw error;
    }
  }

  async completeMobileOidcLogin(params: MobileOidcLoginParams): Promise<void> {
    authStoreAdapter.setLoading(true);

    try {
      const tokens = await this.mobileOidcClient.exchangeCodeForTokens(params);
      await this.sessionBootstrapper.establishSession({
        ...tokens,
        refresh_flow: 'oidc_direct',
      });
    } catch (error) {
      authStoreAdapter.setAccessToken(null);
      throw error;
    } finally {
      authStoreAdapter.setLoading(false);
    }
  }

  async completeMobileAppleLogin(
    params: MobileAppleLoginParams,
  ): Promise<void> {
    return this.completeMobileAppleSignIn(params);
  }

  async logout(): Promise<void> {
    authStoreAdapter.setLoading(true);

    try {
      try {
        if (isWebRuntime()) {
          await this.webSessionClient.endSession();
        } else {
          await authApi.logout();
        }
      } catch (error) {
        console.warn('Sign-out request failed:', error);
      }

      this.resetSession();
    } finally {
      authStoreAdapter.setLoading(false);
    }
  }

  async logoutAllDevices(): Promise<void> {
    authStoreAdapter.setLoading(true);

    try {
      await authApi.logoutAllDevices();
      this.resetSession();
    } finally {
      authStoreAdapter.setLoading(false);
    }
  }

  async refreshToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const currentTokens = authStoreAdapter.getTokens();
    this.refreshPromise = (async () => {
      try {
        const refreshedTokens = isWebRuntime()
          ? await this.webSessionClient.exchangeCookieSession()
          : await this.refreshMobileTokens(currentTokens);

        const tokensResult = validateAuthTokens(refreshedTokens);
        if (!tokensResult.success) {
          throw createSessionExpiredError(
            'The session refresh response was invalid. Please sign in again.',
            'INVALID_SESSION_RESPONSE',
          );
        }

        const mergedTokens =
          !isWebRuntime() &&
          (!tokensResult.data.refresh_token || !tokensResult.data.refresh_flow)
            ? {
                ...tokensResult.data,
                refresh_token:
                  tokensResult.data.refresh_token ??
                  currentTokens?.refresh_token,
                refresh_flow:
                  tokensResult.data.refresh_flow ?? currentTokens?.refresh_flow,
              }
            : tokensResult.data;

        authStoreAdapter.updateTokens(mergedTokens);
      } catch (error) {
        const failureDisposition = classifyRefreshFailure(error);
        if (failureDisposition === 'transient') {
          this.refreshRuntime.scheduleRetryAfterRefreshFailure();
          throw error;
        }

        this.resetSession();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async restoreBrowserSession(): Promise<boolean> {
    if (!isWebRuntime()) {
      return false;
    }

    try {
      const tokens = await this.webSessionClient.exchangeCookieSession();
      return await this.sessionBootstrapper.restoreSession(tokens);
    } catch {
      authStoreAdapter.setAccessToken(null);
      return false;
    }
  }

  private async completeMobileAppleSignIn(
    params: MobileAppleLoginParams,
  ): Promise<void> {
    authStoreAdapter.setLoading(true);

    try {
      const paramsResult = validateMobileAppleLoginParams(params);
      if (!paramsResult.success) {
        throw this.createInvalidApplePayloadError();
      }

      const tokens = await this.mobileAppleClient.exchangeIdentityToken(
        paramsResult.data,
      );
      await this.sessionBootstrapper.establishSession({
        ...tokens,
        refresh_flow: 'apple_exchange',
      });
    } catch (error) {
      authStoreAdapter.setAccessToken(null);
      throw error;
    } finally {
      authStoreAdapter.setLoading(false);
    }
  }

  private createInvalidApplePayloadError(): ApiError {
    return createSignInStateError(
      'Apple returned an invalid sign-in payload.',
      'INVALID_APPLE_SIGN_IN_REQUEST',
    );
  }

  private async refreshMobileTokens(
    tokens: AuthTokens | null,
  ): Promise<AuthTokens> {
    const refreshToken = tokens?.refresh_token;
    if (!refreshToken) {
      throw createSessionExpiredError();
    }

    const refreshFlow = this.resolveMobileRefreshFlow(tokens);
    if (refreshFlow === 'apple_exchange') {
      return this.mobileAppleClient.refreshTokens(refreshToken);
    }

    const refreshedTokens =
      await this.mobileOidcClient.refreshTokens(refreshToken);
    return {
      ...refreshedTokens,
      refresh_token: refreshedTokens.refresh_token ?? refreshToken,
      refresh_flow: refreshFlow,
    };
  }

  private resolveMobileRefreshFlow(
    tokens: AuthTokens | null,
  ): 'oidc_direct' | 'apple_exchange' {
    return tokens?.refresh_flow === 'apple_exchange'
      ? 'apple_exchange'
      : 'oidc_direct';
  }
}

export const authService = AuthService.getInstance();
export {getMobileOidcClientConfig, initMobileOidcConfig, type MobileOidcConfig};
