type LoadingListener = (state: LoadingState) => void;
type ErrorListener = (error: LoadingError) => void;

export type LoadingState = {
  isVisible: boolean;
  activeRequests: number;
  trackedRequests: number;
};

export type LoadingError = {
  message: string;
  timestamp: number;
};

type StartOptions = {
  key?: string;
  silent?: boolean;
  immediate?: boolean;
  maxDurationMs?: number;
};

type ConfigOptions = {
  showDelayMs?: number;
  minimumVisibleMs?: number;
  defaultMaxDurationMs?: number;
};

type TrackedRequest = {
  silent: boolean;
  timeoutId?: ReturnType<typeof setTimeout>;
};

/**
 * Tracks in-flight requests and drives loading indicator visibility with flicker prevention.
 *
 * - Visibility is debounced: delayed on show, held for a minimum duration on hide.
 * - Each request is identified by a unique token returned from startRequest().
 */
class GlobalLoadingManager {
  private listeners = new Set<LoadingListener>();
  private errorListeners = new Set<ErrorListener>();
  private requests = new Map<string, TrackedRequest>();
  private trackedRequestCount = 0;
  private showDelayMs = 300;
  private minimumVisibleMs = 500;
  private defaultMaxDurationMs = 15000;
  private isVisible = false;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private lastShowTimestamp: number | null = null;

  /**
   * Registers a request and returns a token required to complete it via finishRequest().
   *
   * - Silent requests are tracked internally but never affect indicator visibility.
   * - Automatically calls finishRequest after maxDurationMs to prevent stuck loaders.
   */
  startRequest(options?: StartOptions): string {
    const token =
      options?.key ??
      `ld-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const silent = options?.silent ?? false;
    const isInitialTracked = !silent && this.trackedRequestCount === 0;

    const maxDuration = options?.maxDurationMs ?? this.defaultMaxDurationMs;
    const timeoutId = setTimeout(() => {
      if (this.requests.get(token)) {
        this.finishRequest(token);
        this.emitError({message: 'Request timeout', timestamp: Date.now()});
      }
    }, maxDuration);

    this.requests.set(token, {silent, timeoutId});

    if (!silent) {
      this.trackedRequestCount += 1;
      if (isInitialTracked) {
        this.queueShow(options?.immediate === true);
      }
    }

    this.notify();
    return token;
  }

  /**
   * Marks a request as complete and triggers hide logic when no tracked requests remain.
   */
  finishRequest(token: string): void {
    const request = this.requests.get(token);
    if (!request) return;

    if (request.timeoutId) clearTimeout(request.timeoutId);

    this.requests.delete(token);

    if (!request.silent) {
      this.trackedRequestCount = Math.max(0, this.trackedRequestCount - 1);
      if (this.trackedRequestCount === 0) this.queueHide();
    }

    this.notify();
  }

  /**
   * Subscribes to loading state changes; the listener is called immediately with the current state.
   *
   * - Returns an unsubscribe function — call it on unmount to prevent memory leaks.
   */
  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribes to timeout errors emitted when a request exceeds maxDurationMs.
   *
   * - Returns an unsubscribe function.
   */
  subscribeToErrors(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Overrides default timing: show delay, minimum visible duration, and max request duration.
   */
  configure(options: ConfigOptions): void {
    if (typeof options.showDelayMs === 'number')
      this.showDelayMs = Math.max(0, options.showDelayMs);
    if (typeof options.minimumVisibleMs === 'number')
      this.minimumVisibleMs = Math.max(0, options.minimumVisibleMs);
    if (typeof options.defaultMaxDurationMs === 'number')
      this.defaultMaxDurationMs = Math.max(0, options.defaultMaxDurationMs);
  }

  private queueShow(immediate: boolean): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.isVisible) return;

    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (immediate || this.showDelayMs === 0) {
      this.setVisible(true);
      return;
    }

    this.showTimer = setTimeout(() => {
      this.setVisible(true);
      this.showTimer = null;
    }, this.showDelayMs);
  }

  private queueHide(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.isVisible) return;

    const timeSinceShow = this.lastShowTimestamp
      ? Date.now() - this.lastShowTimestamp
      : this.minimumVisibleMs;

    const remaining = Math.max(this.minimumVisibleMs - timeSinceShow, 0);

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (remaining <= 0) {
      this.setVisible(false);
      return;
    }

    this.hideTimer = setTimeout(() => {
      this.setVisible(false);
      this.hideTimer = null;
    }, remaining);
  }

  private setVisible(nextVisible: boolean): void {
    if (this.isVisible === nextVisible) return;
    this.isVisible = nextVisible;
    this.lastShowTimestamp = nextVisible ? Date.now() : null;
    this.notify();
  }

  private getState(): LoadingState {
    return {
      isVisible: this.isVisible,
      activeRequests: this.requests.size,
      trackedRequests: this.trackedRequestCount,
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  private emitError(error: LoadingError): void {
    this.errorListeners.forEach((listener) => listener(error));
  }
}

export const loadingManager = new GlobalLoadingManager();
