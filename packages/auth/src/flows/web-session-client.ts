import {authApi} from '@sykamore/api-client';
import type {AuthTokens, StartWebLoginOptions} from '@sykamore/types';
import {createSessionExpiredError} from '../core/auth-client-errors';
import {getBrowserDocument, getBrowserWindow} from '../core/platform';

const WEB_CSRF_COOKIE_NAME = 'sykamore_csrf_token';

export class WebSessionClient {
  redirectToLogin(returnTo: string, options?: StartWebLoginOptions): void {
    const loginUrl = authApi.getOidcStartUrl(returnTo, options);
    getBrowserWindow().location.assign(loginUrl);
  }

  async exchangeCookieSession(): Promise<AuthTokens> {
    const csrfToken = this.readCsrfCookieToken();
    return authApi.issueWebAccessToken(csrfToken);
  }

  async endSession(): Promise<void> {
    const csrfToken = this.readCsrfCookieToken();
    await authApi.logoutWebSession(csrfToken);
  }

  private readCsrfCookieToken(): string {
    const cookies = getBrowserDocument().cookie.split(';');
    for (const rawCookie of cookies) {
      const [name, ...rest] = rawCookie.trim().split('=');
      if (name === WEB_CSRF_COOKIE_NAME) {
        return decodeURIComponent(rest.join('='));
      }
    }

    throw createSessionExpiredError(
      'Your browser session is missing required security data. Please sign in again.',
      'WEB_SESSION_INVALID',
    );
  }
}
