import type {AuthTokens} from '@sykamore/types';
import {
  authStoreAdapter,
  type AuthSessionSnapshot,
} from '../core/store-adapter';
import {getBrowserDocument, isWebRuntime} from '../core/platform';

const NETWORK_RETRY_DELAY_MS = 60_000;

export class RefreshRuntimeController {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribe: (() => void) | null = null;
  private removeVisibilityListener: (() => void) | null = null;
  private started = false;

  constructor(private readonly refreshAccessToken: () => Promise<void>) {}

  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    authStoreAdapter.syncHttpClientFromStore();
    this.updateRefreshSchedule(authStoreAdapter.getTokens());
    this.unsubscribe = authStoreAdapter.subscribeSession((snapshot) => {
      authStoreAdapter.syncHttpClientFromSnapshot(snapshot);
      this.handleSessionSnapshot(snapshot);
    });

    if (isWebRuntime()) {
      const browserDocument = getBrowserDocument();
      const handleVisibilityChange = () => {
        if (browserDocument.hidden) {
          this.cancelScheduledRefresh();
          return;
        }

        this.updateRefreshSchedule(authStoreAdapter.getTokens());
      };

      browserDocument.addEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
      this.removeVisibilityListener = () => {
        browserDocument.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      };
    }
  }

  stop(): void {
    this.started = false;
    this.cancelScheduledRefresh();
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.removeVisibilityListener?.();
    this.removeVisibilityListener = null;
  }

  scheduleRetryAfterRefreshFailure(): void {
    this.cancelScheduledRefresh();
    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken().catch((error) => {
        console.warn('Retrying session refresh failed:', error);
      });
    }, NETWORK_RETRY_DELAY_MS);
  }

  cancelScheduledRefresh(): void {
    if (!this.refreshTimer) {
      return;
    }

    clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
  }

  private handleSessionSnapshot(snapshot: AuthSessionSnapshot): void {
    this.updateRefreshSchedule(snapshot.tokens);
  }

  private updateRefreshSchedule(tokens: AuthTokens | null): void {
    const accessToken = tokens?.access_token;
    const expiresIn = tokens?.expires_in;
    const issuedAt = tokens?.issued_at;

    if (!accessToken || expiresIn === undefined || issuedAt === undefined) {
      this.cancelScheduledRefresh();
      return;
    }

    if (isWebRuntime() && getBrowserDocument().hidden) {
      this.cancelScheduledRefresh();
      return;
    }

    this.scheduleRefresh(issuedAt, expiresIn);
  }

  private scheduleRefresh(issuedAt: number, expiresIn: number): void {
    this.cancelScheduledRefresh();

    const expiresAt = issuedAt + expiresIn * 1000;
    const refreshAt = Math.max(expiresAt - 60_000, Date.now() + 1_000);
    const delay = Math.max(refreshAt - Date.now(), 1_000);

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken().catch((error) => {
        console.warn('Session refresh failed:', error);
      });
    }, delay);
  }
}
