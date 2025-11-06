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

class GlobalLoadingManager {
  // Observable pattern: UI components subscribe to state changes
  private listeners = new Set<LoadingListener>();

  private errorListeners = new Set<ErrorListener>();

  // Token-based tracking: each request gets unique token
  private requests = new Map<string, TrackedRequest>();

  private trackedRequestCount = 0;

  // Timing configuration: prevent flicker and ensure visibility
  private showDelayMs = 300;

  private minimumVisibleMs = 500;

  private defaultMaxDurationMs = 15000;

  private isVisible = false;

  private showTimer: ReturnType<typeof setTimeout> | null = null;

  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  private lastShowTimestamp: number | null = null;

  // Start tracking a request, returns token for cleanup
  startRequest(options?: StartOptions): string {
    const token =
      options?.key ??
      `ld-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    const silent = options?.silent ?? false;
    const isInitialTracked = !silent && this.trackedRequestCount === 0;

    // Safety timeout prevents infinite loading
    const maxDuration = options?.maxDurationMs ?? this.defaultMaxDurationMs;
    const timeoutId = setTimeout(() => {
      const request = this.requests.get(token);
      if (request) {
        this.finishRequest(token);

        this.emitError({
          message: 'Request timeout',
          timestamp: Date.now(),
        });
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

  // Clean up request by token
  finishRequest(token: string): void {
    const request = this.requests.get(token);
    if (!request) {
      return;
    }

    if (request.timeoutId) {
      clearTimeout(request.timeoutId);
    }

    this.requests.delete(token);

    if (!request.silent) {
      this.trackedRequestCount = Math.max(0, this.trackedRequestCount - 1);

      if (this.trackedRequestCount === 0) {
        this.queueHide();
      }
    }

    this.notify();
  }

  // Subscribe to loading state changes
  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Subscribe to loading errors (timeouts)
  subscribeToErrors(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  // Configure timing behavior
  configure(options: ConfigOptions): void {
    if (typeof options.showDelayMs === 'number') {
      this.showDelayMs = Math.max(0, options.showDelayMs);
    }
    if (typeof options.minimumVisibleMs === 'number') {
      this.minimumVisibleMs = Math.max(0, options.minimumVisibleMs);
    }
    if (typeof options.defaultMaxDurationMs === 'number') {
      this.defaultMaxDurationMs = Math.max(0, options.defaultMaxDurationMs);
    }
  }

  // Delay showing spinner to prevent flicker on fast requests
  private queueShow(immediate: boolean): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.isVisible) {
      return;
    }

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

  // Ensure spinner stays visible long enough to be perceived
  private queueHide(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.isVisible) {
      return;
    }

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
    if (this.isVisible === nextVisible) {
      return;
    }

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

  // Notify all subscribers of state changes
  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      listener(state);
    });
  }

  private emitError(error: LoadingError): void {
    this.errorListeners.forEach((listener) => {
      listener(error);
    });
  }
}

export const loadingManager = new GlobalLoadingManager();
